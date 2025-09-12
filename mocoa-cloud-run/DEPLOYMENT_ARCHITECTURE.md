# DEPLOYMENT ARCHITECTURE - FINAL CLARIFICATION

## CLOUDFLARE (Static Only)
- asoos.2100.cool = Static marketing/public site
- *.2100.cool domains = Static content hosting ONLY
- Cloudflare Pages for static HTML/CSS/JS
- NO dynamic applications on Cloudflare

## GOOGLE CLOUD PLATFORM (Dynamic Applications)
- All Node.js applications 
- All Express servers
- All database-connected services
- All API endpoints
- mocoa-owner-interface-* = GCP Cloud Run
- integration-gateway-* = GCP Cloud Run
- All *.run.app domains = GCP Cloud Run

## RULE: 
- Cloudflare = Domain hosting + Static sites ONLY
- GCP = ALL dynamic applications and services
- NO wrangler.toml files in dynamic app directories
- NO Cloudflare Workers for dynamic applications
