# Sensitive Data Practices: Secrets

## Managing Secrets
- **Never commit secrets to the repository**: This includes passwords, API keys, tokens, or private certificates. Always use environment variables or secret management tools.
- **Use GitHub Secrets for workflows**: If you rely on GitHub Actions, store sensitive variables in the repository’s Secrets settings rather than committing them to code.
- **Rotate secrets regularly**: Change secrets periodically and revoke unused or exposed credentials immediately.
- **Access control**: Limit repository and secret access to only those who need it.
- **Utilize secret scanning**: Enable GitHub’s secret scanning feature to detect accidental leaks promptly.

## What to do if a Secret is Committed
1. **Remove the secret immediately** from all commits and branches using tools such as git filter-repo or BFG.
2. **Invalidate and rotate the secret** to prevent unauthorized usage.
3. **Audit repository and access logs** for suspicious activities tied to the exposed secret.

## References
- [GitHub Docs: Keeping secrets safe](https://docs.github.com/en/actions/security-guides/keeping-your-github-actions-secrets-secure)
- [GitHub Docs: Removing sensitive data](https://docs.github.com/en/code-security/security-advisories/removing-sensitive-data-from-a-repository)


