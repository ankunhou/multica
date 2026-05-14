package i18n

import (
	"strings"
	"testing"
	"time"
)

func TestNormalizeLocale(t *testing.T) {
	tests := []struct {
		in   string
		want string
	}{
		{"", "en"},
		{"en-US", "en"},
		{"zh-Hans", "zh-Hans"},
		{"zh-CN", "zh-Hans"},
		{"fr-FR", "en"},
	}

	for _, tt := range tests {
		if got := NormalizeLocale(tt.in); got != tt.want {
			t.Errorf("NormalizeLocale(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestLocaleFromAcceptLanguage(t *testing.T) {
	if got := LocaleFromAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8"); got != LocaleZhHans {
		t.Fatalf("expected zh-Hans, got %q", got)
	}
	if got := LocaleFromAcceptLanguage("fr-FR, en-US;q=0.8"); got != LocaleEN {
		t.Fatalf("expected en fallback, got %q", got)
	}
}

func TestAutopilotPausedBodyZhHans(t *testing.T) {
	body := AutopilotPausedBody("zh-Hans", 11, 12, 91.7, 7*24*time.Hour)
	for _, want := range []string{"过去 7 天内", "11/12 次运行失败", "自动暂停"} {
		if !strings.Contains(body, want) {
			t.Fatalf("body missing %q: %s", want, body)
		}
	}
}

func TestAutopilotIssueDescriptionNote(t *testing.T) {
	triggeredAt := time.Date(2026, 5, 13, 20, 14, 0, 0, time.UTC)

	en := AutopilotIssueDescriptionNote("en", triggeredAt)
	for _, want := range []string{
		"Autopilot run triggered at 2026-05-13 20:14 UTC",
		"rename this issue",
	} {
		if !strings.Contains(en, want) {
			t.Fatalf("English note missing %q: %s", want, en)
		}
	}

	zh := AutopilotIssueDescriptionNote("zh-Hans", triggeredAt)
	for _, want := range []string{
		"自动化运行于 2026-05-13 20:14 UTC 触发",
		"请将这个议题重命名",
	} {
		if !strings.Contains(zh, want) {
			t.Fatalf("Chinese note missing %q: %s", want, zh)
		}
	}
}
