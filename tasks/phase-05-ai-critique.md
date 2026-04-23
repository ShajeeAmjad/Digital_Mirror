# Phase 5 — AI Critique & Paywall

**Goal**: Paywalled AI critique flow. RevenueCat handles subscriptions. Claude API
analyses the completed look and returns scored tips + product recommendations.
Reference: @docs/architecture.md (AI critique flow), @docs/data-model.md

---

## 5.1 RevenueCat setup (mobile)

- [ ] Configure RevenueCat SDK in `apps/mobile/App.tsx`:
      `Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: supabase_user_id })`
- [ ] Create `apps/mobile/src/hooks/useSubscription.ts`:
      - Fetches `CustomerInfo` from RevenueCat on mount
      - Returns `{ isPremium: boolean, isLoading: boolean, customerInfo }`
      - `isPremium = customerInfo.entitlements["premium"]?.isActive ?? false`
- [ ] Create products in RevenueCat dashboard:
      - Monthly: `digital_mirror_monthly`
      - Annual: `digital_mirror_annual`
      - Link to App Store Connect + Google Play products

## 5.2 Paywall screen (mobile)

- [ ] Implement `PaywallScreen` (wireframe 11):
      - Show premium features list (AI critique, premium tutorials, trends feed)
      - Monthly / annual price options (fetched live from RevenueCat `getOfferings()`)
      - "Start free trial" / "Subscribe" CTA using `Purchases.purchasePackage()`
      - Restore purchases link: `Purchases.restorePurchases()`
      - On successful purchase: navigate back to the screen that triggered the paywall

## 5.3 Paywall gate (mobile)

- [ ] Create `apps/mobile/src/components/PaywallGate.tsx`:
      ```tsx
      // Wraps any component; redirects to Paywall screen if not premium
      <PaywallGate feature="ai_critique">
        <AICritiqueButton />
      </PaywallGate>
      ```
- [ ] Wrap all paywalled UI elements: "Generate with AI" in Editor, premium tutorials,
      trends feed, AI critique screen

## 5.4 AI critique endpoint (backend)

- [ ] Create `backend/app/prompts/critique_system.txt` — system prompt for Claude:
      ```
      You are a professional makeup artist and beauty consultant. Analyse the provided
      photo of a makeup look. Return a JSON object with exactly this shape:
      {
        "score": <int 1-10>,
        "strengths": [<string>, ...],
        "improvements": [
          { "area": <string>, "tip": <string>, "priority": "high"|"medium"|"low" }
        ],
        "overall": <string, 2-3 sentence summary>
      }
      Return ONLY the JSON object. No preamble, no markdown fences.
      ```
- [ ] `POST /api/v1/critique` endpoint:
      - Gate with `Depends(require_subscription)` — returns 403 if not premium
      - Body: `{ look_id: string }`
      - Fetch the result image from R2 using `look.result_key`
      - Encode as base64 JPEG
      - Call Claude API (model: `claude-opus-4-5`) with image + system prompt
      - Parse JSON response; validate shape with Pydantic
      - Fetch recommended products from `products` table matching user skin tone + look category
      - Save to `critique_results` table
      - Return `{ score, strengths, improvements, overall, products: Product[] }`
- [ ] Unit tests:
      - Mock Claude API call — verify 403 for free user, 200 for premium
      - Verify JSON parsing handles malformed Claude response gracefully (return 503)

## 5.5 AI critique screen (mobile)

- [ ] Implement `AICritiqueScreen` (wireframe 8):
      - Show result photo at top
      - Score display (animated radial progress, e.g. "8/10")
      - Strengths section (green chips)
      - Improvements section (expandable list: area → tip, colour-coded by priority)
      - Overall summary paragraph
      - CTA: "See recommended products" → navigate to `ProductRecommendations`
      - Loading state: show skeleton while API call is in flight
      - Error state: "Could not analyse your look — try again"

## 5.6 Product recommendations screen (mobile)

- [ ] Implement `ProductRecommendationsScreen` (wireframe 9):
      - Receive `product_ids` from critique result
      - Display products in a card list: brand, name, shade swatch, price, "Shop" button
      - "Shop" opens affiliate URL in in-app browser (`expo-web-browser`)
      - Non-AI product browsing (all products, filterable by category) available to all users
      via `GET /api/v1/products` with query params `?category=&skin_tone=`

---

**Phase 5 done when**: Free user tapping "Generate with AI" sees the paywall. Premium user
gets a scored critique with tips and product links. RevenueCat subscription state correctly
gates the backend endpoint (tested with a sandbox subscription).
