package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/multica-ai/multica/server/internal/logger"
	db "github.com/multica-ai/multica/server/pkg/db/generated"
)

const (
	maxAgentGenerationPromptLength = 1000
	maxGeneratedAgentNameLength    = 32
	defaultAgentGenerationModel    = "gpt-5-mini"
	defaultOpenAIBaseURL           = "https://api.openai.com/v1"
)

var errAgentGenerationNotConfigured = errors.New("agent generation is not configured")

type GenerateAgentDraftRequest struct {
	Prompt string `json:"prompt"`
}

type AgentDraft struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Instructions string `json:"instructions"`
}

type AgentDraftGenerationInput struct {
	Prompt        string
	ExistingNames []string
}

type AgentDraftGenerator interface {
	GenerateAgentDraft(ctx context.Context, input AgentDraftGenerationInput) (AgentDraft, error)
}

func (h *Handler) GenerateAgentDraft(w http.ResponseWriter, r *http.Request) {
	if h.AgentDraftGenerator == nil {
		writeError(w, http.StatusServiceUnavailable, "agent generation is not configured; set OPENAI_API_KEY to enable it")
		return
	}

	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace id")
	if !ok {
		return
	}
	if _, ok := h.workspaceMember(w, r, workspaceID); !ok {
		return
	}

	var req GenerateAgentDraftRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	prompt := strings.TrimSpace(req.Prompt)
	if prompt == "" {
		writeError(w, http.StatusBadRequest, "prompt is required")
		return
	}
	if utf8.RuneCountInString(prompt) > maxAgentGenerationPromptLength {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("prompt must be %d characters or fewer", maxAgentGenerationPromptLength))
		return
	}

	agents, err := h.Queries.ListAllAgents(r.Context(), wsUUID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list agents")
		return
	}

	existingNames := agentNames(agents)
	draft, err := h.AgentDraftGenerator.GenerateAgentDraft(r.Context(), AgentDraftGenerationInput{
		Prompt:        prompt,
		ExistingNames: existingNames,
	})
	if err != nil {
		slog.Warn("agent generation failed", append(logger.RequestAttrs(r), "error", err)...)
		writeError(w, http.StatusBadGateway, "failed to generate agent")
		return
	}

	draft, err = normalizeGeneratedAgentDraft(draft, existingNames)
	if err != nil {
		slog.Warn("agent generation returned invalid draft", append(logger.RequestAttrs(r), "error", err)...)
		writeError(w, http.StatusBadGateway, "failed to generate agent")
		return
	}

	writeJSON(w, http.StatusOK, draft)
}

func agentNames(agents []db.Agent) []string {
	names := make([]string, 0, len(agents))
	for _, agent := range agents {
		name := strings.TrimSpace(agent.Name)
		if name != "" {
			names = append(names, name)
		}
	}
	return names
}

func normalizeGeneratedAgentDraft(draft AgentDraft, existingNames []string) (AgentDraft, error) {
	draft.Name = truncateRunes(strings.TrimSpace(draft.Name), maxGeneratedAgentNameLength)
	draft.Description = truncateRunes(strings.TrimSpace(draft.Description), maxAgentDescriptionLength)
	draft.Instructions = strings.TrimSpace(draft.Instructions)

	if draft.Name == "" {
		return AgentDraft{}, errors.New("generated name is empty")
	}
	if draft.Description == "" {
		return AgentDraft{}, errors.New("generated description is empty")
	}
	if draft.Instructions == "" {
		return AgentDraft{}, errors.New("generated instructions are empty")
	}

	draft.Name = uniqueGeneratedAgentName(draft.Name, existingNames)
	return draft, nil
}

func truncateRunes(value string, max int) string {
	if max <= 0 {
		return ""
	}
	if utf8.RuneCountInString(value) <= max {
		return value
	}
	runes := []rune(value)
	if max <= 3 {
		return string(runes[:max])
	}
	return strings.TrimSpace(string(runes[:max-3])) + "..."
}

func uniqueGeneratedAgentName(baseName string, existingNames []string) string {
	existing := make(map[string]struct{}, len(existingNames))
	for _, name := range existingNames {
		existing[strings.ToLower(strings.TrimSpace(name))] = struct{}{}
	}
	if _, ok := existing[strings.ToLower(strings.TrimSpace(baseName))]; !ok {
		return baseName
	}

	for i := 2; i < 100; i++ {
		suffix := fmt.Sprintf(" %d", i)
		root := truncateRunes(baseName, maxGeneratedAgentNameLength-utf8.RuneCountInString(suffix))
		candidate := root + suffix
		if _, ok := existing[strings.ToLower(candidate)]; !ok {
			return candidate
		}
	}

	return truncateRunes(baseName, maxGeneratedAgentNameLength-3) + " 99"
}

type OpenAIAgentDraftGenerator struct {
	APIKey     string
	BaseURL    string
	Model      string
	HTTPClient *http.Client
}

func NewOpenAIAgentDraftGeneratorFromEnv() AgentDraftGenerator {
	apiKey := strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
	if apiKey == "" {
		return nil
	}

	baseURL := firstNonEmptyEnv("OPENAI_AGENT_GENERATION_BASE_URL", "OPENAI_BASE_URL")
	if baseURL == "" {
		baseURL = defaultOpenAIBaseURL
	}

	model := firstNonEmptyEnv("OPENAI_AGENT_GENERATION_MODEL", "OPENAI_MODEL")
	if model == "" {
		model = defaultAgentGenerationModel
	}

	return &OpenAIAgentDraftGenerator{
		APIKey:     apiKey,
		BaseURL:    strings.TrimRight(baseURL, "/"),
		Model:      model,
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func firstNonEmptyEnv(keys ...string) string {
	for _, key := range keys {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			return value
		}
	}
	return ""
}

func (g *OpenAIAgentDraftGenerator) GenerateAgentDraft(ctx context.Context, input AgentDraftGenerationInput) (AgentDraft, error) {
	if g == nil || strings.TrimSpace(g.APIKey) == "" {
		return AgentDraft{}, errAgentGenerationNotConfigured
	}

	draft, err := g.generateWithChatCompletions(ctx, input, true)
	var statusErr *providerStatusError
	if errors.As(err, &statusErr) && (statusErr.Status == http.StatusBadRequest || statusErr.Status == http.StatusUnprocessableEntity) {
		return g.generateWithChatCompletions(ctx, input, false)
	}
	return draft, err
}

func (g *OpenAIAgentDraftGenerator) generateWithChatCompletions(ctx context.Context, input AgentDraftGenerationInput, useJSONMode bool) (AgentDraft, error) {
	httpClient := g.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 30 * time.Second}
	}

	payload, err := json.Marshal(map[string]any{
		"prompt":               input.Prompt,
		"existing_agent_names": input.ExistingNames,
	})
	if err != nil {
		return AgentDraft{}, err
	}

	reqBody := openAIChatCompletionsRequest{
		Model: g.Model,
		Messages: []openAIChatMessage{
			{
				Role:    "system",
				Content: agentDraftGenerationInstructions(),
			},
			{
				Role:    "user",
				Content: "Generate an agent draft from this JSON input:\n" + string(payload),
			},
		},
	}
	if useJSONMode {
		reqBody.ResponseFormat = &openAIChatResponseFormat{Type: "json_object"}
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return AgentDraft{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, strings.TrimRight(g.BaseURL, "/")+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return AgentDraft{}, err
	}
	req.Header.Set("Authorization", "Bearer "+g.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return AgentDraft{}, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return AgentDraft{}, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return AgentDraft{}, openAIErrorFromResponse(resp.StatusCode, respBody)
	}

	var parsed openAIChatCompletionsResponse
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return AgentDraft{}, err
	}
	outputText := strings.TrimSpace(parsed.OutputText())
	if outputText == "" {
		return AgentDraft{}, errors.New("model response had no output text")
	}
	outputText = extractJSONObject(outputText)

	var draft AgentDraft
	if err := json.Unmarshal([]byte(outputText), &draft); err != nil {
		return AgentDraft{}, err
	}
	return draft, nil
}

type openAIChatCompletionsRequest struct {
	Model          string                    `json:"model"`
	Messages       []openAIChatMessage       `json:"messages"`
	ResponseFormat *openAIChatResponseFormat `json:"response_format,omitempty"`
}

type openAIChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIChatResponseFormat struct {
	Type string `json:"type"`
}

type openAIChatCompletionsResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func (r openAIChatCompletionsResponse) OutputText() string {
	if len(r.Choices) == 0 {
		return ""
	}
	return r.Choices[0].Message.Content
}

func extractJSONObject(value string) string {
	trimmed := strings.TrimSpace(value)
	if strings.HasPrefix(trimmed, "{") && strings.HasSuffix(trimmed, "}") {
		return trimmed
	}
	start := strings.Index(trimmed, "{")
	end := strings.LastIndex(trimmed, "}")
	if start >= 0 && end > start {
		return trimmed[start : end+1]
	}
	return trimmed
}

type providerStatusError struct {
	Status  int
	Message string
}

func (e *providerStatusError) Error() string {
	if e.Message == "" {
		return fmt.Sprintf("provider API error %d", e.Status)
	}
	return fmt.Sprintf("provider API error %d: %s", e.Status, e.Message)
}

func openAIErrorFromResponse(status int, body []byte) error {
	var parsed struct {
		Error *struct {
			Message string `json:"message"`
			Type    string `json:"type"`
			Code    any    `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal(body, &parsed); err == nil && parsed.Error != nil && parsed.Error.Message != "" {
		return &providerStatusError{Status: status, Message: parsed.Error.Message}
	}
	bodyText := strings.TrimSpace(string(body))
	if bodyText == "" {
		return &providerStatusError{Status: status}
	}
	return &providerStatusError{Status: status, Message: truncateRunes(bodyText, 300)}
}

func agentDraftGenerationInstructions() string {
	return strings.TrimSpace(`
You generate Multica AI agent configurations from a short user brief.

Return a JSON object only, with exactly these keys:
- name: concise, human-readable, 32 characters or fewer.
- description: one sentence, 255 characters or fewer.
- instructions: Markdown instructions for the agent. Include role, responsibilities, operating style, when to ask clarifying questions, and how to report blockers or risks.

Rules:
- Use the same language as the user brief.
- Avoid copying an existing agent name exactly.
- Do not claim tools, integrations, permissions, or repositories that the user did not mention.
- Prefer practical, work-ready instructions over marketing copy.
`)
}
