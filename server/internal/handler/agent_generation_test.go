package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type fakeAgentDraftGenerator struct {
	input AgentDraftGenerationInput
	draft AgentDraft
	err   error
}

func (g *fakeAgentDraftGenerator) GenerateAgentDraft(_ context.Context, input AgentDraftGenerationInput) (AgentDraft, error) {
	g.input = input
	return g.draft, g.err
}

func TestGenerateAgentDraftUsesConfiguredGenerator(t *testing.T) {
	if testHandler == nil {
		t.Skip("database not available")
	}

	prev := testHandler.AgentDraftGenerator
	fake := &fakeAgentDraftGenerator{
		draft: AgentDraft{
			Name:         "Handler Test Agent",
			Description:  "Reviews frontend PRs for accessibility and state management.",
			Instructions: "# Role\nReview frontend PRs.",
		},
	}
	testHandler.AgentDraftGenerator = fake
	t.Cleanup(func() { testHandler.AgentDraftGenerator = prev })

	w := httptest.NewRecorder()
	req := newRequest(http.MethodPost, "/api/agents/generate", map[string]any{
		"prompt": "Review frontend PRs for accessibility and state management.",
	})
	testHandler.GenerateAgentDraft(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("GenerateAgentDraft: expected 200, got %d: %s", w.Code, w.Body.String())
	}
	if fake.input.Prompt != "Review frontend PRs for accessibility and state management." {
		t.Fatalf("unexpected prompt passed to generator: %q", fake.input.Prompt)
	}
	if !containsAgentGenerationTestString(fake.input.ExistingNames, "Handler Test Agent") {
		t.Fatalf("expected existing agent names to include handler fixture, got %#v", fake.input.ExistingNames)
	}

	var resp AgentDraft
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if resp.Name != "Handler Test Agent 2" {
		t.Fatalf("expected duplicate name to be made unique, got %q", resp.Name)
	}
	if resp.Instructions == "" {
		t.Fatalf("expected generated instructions")
	}
}

func TestGenerateAgentDraftRequiresConfiguredGenerator(t *testing.T) {
	if testHandler == nil {
		t.Skip("database not available")
	}

	prev := testHandler.AgentDraftGenerator
	testHandler.AgentDraftGenerator = nil
	t.Cleanup(func() { testHandler.AgentDraftGenerator = prev })

	w := httptest.NewRecorder()
	req := newRequest(http.MethodPost, "/api/agents/generate", map[string]any{
		"prompt": "Review frontend PRs.",
	})
	testHandler.GenerateAgentDraft(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("GenerateAgentDraft: expected 503, got %d: %s", w.Code, w.Body.String())
	}
}

func TestOpenAIAgentDraftGeneratorParsesStructuredOutput(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/chat/completions" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatalf("unexpected authorization header: %q", r.Header.Get("Authorization"))
		}

		var req map[string]any
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("decode OpenAI request: %v", err)
		}
		if req["model"] != "gpt-test" {
			t.Fatalf("unexpected model: %#v", req["model"])
		}
		messages := req["messages"].([]any)
		lastMessage := messages[len(messages)-1].(map[string]any)
		if !strings.Contains(lastMessage["content"].(string), "frontend PRs") {
			t.Fatalf("request input did not include prompt: %#v", lastMessage["content"])
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"choices": []map[string]any{
				{
					"message": map[string]any{
						"content": `{"name":"PR Reviewer","description":"Reviews frontend PRs for accessibility and state management.","instructions":"# Role\nReview frontend PRs."}`,
					},
				},
			},
		})
	}))
	defer server.Close()

	generator := &OpenAIAgentDraftGenerator{
		APIKey:     "test-key",
		BaseURL:    server.URL + "/v1",
		Model:      "gpt-test",
		HTTPClient: server.Client(),
	}
	draft, err := generator.GenerateAgentDraft(context.Background(), AgentDraftGenerationInput{
		Prompt:        "Review frontend PRs",
		ExistingNames: []string{"Existing"},
	})
	if err != nil {
		t.Fatalf("GenerateAgentDraft returned error: %v", err)
	}
	if draft.Name != "PR Reviewer" {
		t.Fatalf("unexpected generated name: %q", draft.Name)
	}
	if !strings.Contains(draft.Instructions, "Review frontend PRs") {
		t.Fatalf("unexpected instructions: %q", draft.Instructions)
	}
}

func TestOpenAIAgentDraftGeneratorRetriesWithoutJSONMode(t *testing.T) {
	requests := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		var req map[string]any
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("decode OpenAI request: %v", err)
		}
		if requests == 1 {
			if req["response_format"] == nil {
				t.Fatalf("expected first request to use JSON mode")
			}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]any{
				"error": map[string]any{"message": "response_format is not supported"},
			})
			return
		}
		if req["response_format"] != nil {
			t.Fatalf("expected retry to omit response_format")
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"choices": []map[string]any{
				{
					"message": map[string]any{
						"content": "Sure:\n{\"name\":\"PR Reviewer\",\"description\":\"Reviews frontend PRs.\",\"instructions\":\"# Role\\nReview frontend PRs.\"}",
					},
				},
			},
		})
	}))
	defer server.Close()

	generator := &OpenAIAgentDraftGenerator{
		APIKey:     "test-key",
		BaseURL:    server.URL + "/v1",
		Model:      "gpt-test",
		HTTPClient: server.Client(),
	}
	draft, err := generator.GenerateAgentDraft(context.Background(), AgentDraftGenerationInput{
		Prompt: "Review frontend PRs",
	})
	if err != nil {
		t.Fatalf("GenerateAgentDraft returned error: %v", err)
	}
	if requests != 2 {
		t.Fatalf("expected two requests, got %d", requests)
	}
	if draft.Name != "PR Reviewer" {
		t.Fatalf("unexpected generated name: %q", draft.Name)
	}
}

func containsAgentGenerationTestString(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
