export function validDiscordId(value: unknown): value is string {
  return typeof value === "string" && /^[1-9][0-9]{16,19}$/.test(value)
    && (value.length < 20 || value <= "18446744073709551615");
}
