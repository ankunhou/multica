package i18n

import (
	"fmt"
	"strings"
	"time"
)

const (
	LocaleEN     = "en"
	LocaleZhHans = "zh-Hans"
)

// NormalizeLocale returns the nearest supported locale, defaulting to English.
func NormalizeLocale(locale string) string {
	locale = strings.TrimSpace(locale)
	if locale == "" {
		return LocaleEN
	}

	lower := strings.ToLower(locale)
	switch {
	case lower == "zh-hans", lower == "zh_cn", lower == "zh-cn", strings.HasPrefix(lower, "zh"):
		return LocaleZhHans
	case lower == "en", strings.HasPrefix(lower, "en-"):
		return LocaleEN
	default:
		return LocaleEN
	}
}

// LocaleFromAcceptLanguage picks the first supported language from a simple
// Accept-Language header. Quality values are ignored because supported locale
// coverage is intentionally tiny today.
func LocaleFromAcceptLanguage(header string) string {
	for _, part := range strings.Split(header, ",") {
		tag := strings.TrimSpace(strings.Split(part, ";")[0])
		if tag == "" {
			continue
		}
		locale := NormalizeLocale(tag)
		if locale != LocaleEN || strings.HasPrefix(strings.ToLower(tag), "en") {
			return locale
		}
	}
	return LocaleEN
}

func IsZhHans(locale string) bool {
	return NormalizeLocale(locale) == LocaleZhHans
}

func VerificationCodeSubject(locale string) string {
	if IsZhHans(locale) {
		return "你的 Multica 验证码"
	}
	return "Your Multica verification code"
}

func VerificationCodeHTML(locale, code string) string {
	if IsZhHans(locale) {
		return fmt.Sprintf(
			`<div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
				<h2>你的验证码</h2>
				<p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">%s</p>
				<p>验证码将在 10 分钟后过期。</p>
				<p style="color: #666; font-size: 14px;">如果这不是你本人操作，可以忽略这封邮件。</p>
			</div>`, code)
	}

	return fmt.Sprintf(
		`<div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
			<h2>Your verification code</h2>
			<p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">%s</p>
			<p>This code expires in 10 minutes.</p>
			<p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
		</div>`, code)
}

func VerificationCodeSentMessage(locale string) string {
	if IsZhHans(locale) {
		return "验证码已发送"
	}
	return "Verification code sent"
}

func InvitationSubject(locale, inviterName, workspaceName string) string {
	if IsZhHans(locale) {
		return fmt.Sprintf("%s 邀请你加入 Multica 工作区 %s", inviterName, workspaceName)
	}
	return fmt.Sprintf("%s invited you to %s on Multica", inviterName, workspaceName)
}

func InvitationHTML(locale, inviterName, workspaceName, inviteURL string) string {
	if IsZhHans(locale) {
		return fmt.Sprintf(
			`<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
				<h2>你被邀请加入 %s</h2>
				<p><strong>%s</strong> 邀请你在 Multica 的 <strong>%s</strong> 工作区协作。</p>
				<p style="margin: 24px 0;">
					<a href="%s" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">接受邀请</a>
				</p>
				<p style="color: #666; font-size: 14px;">你需要先登录，才能接受或拒绝邀请。</p>
			</div>`, workspaceName, inviterName, workspaceName, inviteURL)
	}

	return fmt.Sprintf(
		`<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
			<h2>You're invited to join %s</h2>
			<p><strong>%s</strong> invited you to collaborate in the <strong>%s</strong> workspace on Multica.</p>
			<p style="margin: 24px 0;">
				<a href="%s" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">Accept invitation</a>
			</p>
			<p style="color: #666; font-size: 14px;">You'll need to log in to accept or decline the invitation.</p>
		</div>`, workspaceName, inviterName, workspaceName, inviteURL)
}

func AutopilotPausedTitle(locale, autopilotTitle string) string {
	if IsZhHans(locale) {
		return fmt.Sprintf("自动化已暂停：%s", autopilotTitle)
	}
	return fmt.Sprintf("Autopilot paused: %s", autopilotTitle)
}

func AutopilotPausedBody(locale string, failedRuns, totalRuns int64, failPct float64, lookback time.Duration) string {
	if IsZhHans(locale) {
		return fmt.Sprintf(
			"过去 %s内 %d/%d 次运行失败（%.1f%%），因此已自动暂停。请检查失败原因、修复根因，然后在自动化页面重新启用。",
			FormatDuration(locale, lookback), failedRuns, totalRuns, failPct,
		)
	}
	return fmt.Sprintf(
		"Auto-paused after %d of %d runs failed (%.1f%%) in the last %s. Investigate the failures, fix the root cause, then re-enable from the autopilot page.",
		failedRuns, totalRuns, failPct, FormatDuration(locale, lookback),
	)
}

func QuickCreateFailedTitle(locale string) string {
	if IsZhHans(locale) {
		return "快速创建失败"
	}
	return "Quick create failed"
}

func QuickCreateDefaultFailure(locale string) string {
	if IsZhHans(locale) {
		return "快速创建未成功完成"
	}
	return "Quick create did not finish successfully"
}

func FormatDuration(locale string, d time.Duration) string {
	if d <= 0 {
		return "0s"
	}
	hours := d / time.Hour
	if hours >= 24 && d%(24*time.Hour) == 0 {
		days := hours / 24
		if IsZhHans(locale) {
			return fmt.Sprintf("%d 天", days)
		}
		if days == 1 {
			return "1 day"
		}
		return fmt.Sprintf("%d days", days)
	}
	if d%time.Hour == 0 {
		if IsZhHans(locale) {
			return fmt.Sprintf("%d 小时", hours)
		}
		if hours == 1 {
			return "1 hour"
		}
		return fmt.Sprintf("%d hours", hours)
	}
	return d.String()
}
