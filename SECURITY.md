# Security Policy

## Supported Versions

Only the latest published major version receives security updates.

| Version | Supported |
| ------- | --------- |
| 2.x     | ✅        |
| < 2.0   | ❌        |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report them privately via GitHub's
[security advisory](https://github.com/rudalkunwar/react-gallimaps/security/advisories/new)
form, or by contacting the maintainer directly. We aim to acknowledge reports
within 72 hours and will keep you informed as we work on a fix.

Note that this package is a thin wrapper around the GalliMaps Vector Plugin and
its REST APIs. Access tokens you pass to `GallimapsProvider` / `GalliApiClient`
are sent to GalliMaps as request parameters; the library redacts them from error
messages, but treat any token that ships to the browser as public and scope it
with a domain restriction. Issues with the GalliMaps service itself or with
access tokens should be directed to [GalliMaps](https://gallimap.com/).
