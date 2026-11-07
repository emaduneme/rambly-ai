# Kit API check (plan Task 1)

Run 2026-10-23 with `scripts/kit-check.mjs` against form 10085449, using Emmanuel's test address.

## Decision

`SIGNUP_MODE = "api"`: create the subscriber as `inactive`, then add them to the form. Kit sends the form's confirmation email.

## Calls that work

All calls use `https://api.kit.com/v4` and the `X-Kit-Api-Key` header.

| Purpose | Call | Result |
|---|---|---|
| Create subscriber, unconfirmed | `POST /subscribers` `{ email_address, state: "inactive", fields }` | 201, state `inactive`, fields saved |
| Add to waitlist form | `POST /forms/{KIT_FORM_ID}/subscribers` `{ email_address, referrer }` | 201, state stays `inactive`, referrer saved, **confirmation email sent** (arrived in the inbox) |
| Update fields on an existing subscriber | `POST /subscribers` `{ email_address, fields }` (upsert) | 200, new field saved, existing fields kept, state unchanged |
| Tag by email | `POST /tags/{tag_id}/subscribers` `{ email_address }` | 201 |
| Look up by email | `GET /subscribers?email_address=...&status=all` | 200. A brand-new subscriber can take a few seconds to show up here. |

## Confirmed afterwards

- Clicking the confirmation link changes state `inactive` → `active`.
- Signing up an address that is already confirmed: `POST /subscribers` with `state: "inactive"` returns 200 and the state **stays `active`**; adding to the form again returns 200 ("already on the form"). The visitor sees the normal "check your inbox" message. It does overwrite the UTM fields and signup date with the newer values.
- End to end with the real `api/subscribe.ts` and Kit client (2026-10-24, `+e2e` test address): step 1 → 200 with a token, step 2 → 200. In Kit: state `inactive` (awaiting confirmation), all six fields saved, tag "Grad student (PhD)" added.
- Kit's subscriber search lags behind writes by several seconds; a lookup right after signup can show the subscriber missing or with empty fields.

## Notes

- The confirmation email is sent from the Kit account's default sender address and uses the account's default email template. Change both in Kit's settings, not in code.
