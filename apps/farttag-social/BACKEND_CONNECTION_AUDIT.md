# FartTag Social Backend Connection Audit

Audited against the current working tree on 2026-06-14.

## Summary

- Every HTTP request currently declared in `src/features/**/**Api.ts` has a matching ASP.NET controller route.
- Every matching controller action calls a registered application service implementation, except audio upload/streaming, which intentionally uses `FartSocialDbContext` directly.
- Full profile, public profile, user search, comment-list, feed replay URL, and fart-detail device/comment contracts were added after the initial audit.
- The app is not operationally connected to protected backend routes because it never authenticates and never calls `setApiAccessToken`.
- Several read APIs silently replace backend errors or empty responses with mock data. Some mutation APIs also report mock success after backend failure.
- Several visible app actions are local-only or placeholders and have no backend call.

## Declared HTTP Calls

| Frontend call | HTTP route | Backend action | Backend method | Status |
| --- | --- | --- | --- | --- |
| `badgesApi.getCatalog` | `GET /api/badges` | `BadgesController.GetAll` | `IBadgeService.GetAllAsync` | Route connected |
| `badgesApi.getMine` | `GET /api/badges/me` | `BadgesController.GetMine` | `IBadgeService.GetMyBadgesAsync` | Route connected |
| `detectionApi.uploadAudio` | `POST /api/fart-events/audio` | `FartEventsController.UploadAudio` | Direct `FartSocialDbContext` persistence | Route connected |
| `detectionApi.uploadEvent` | `POST /api/fart-events` | `FartEventsController.Create` | `IFartEventService.CreateAsync` | Route connected; BLE device ID is invalid |
| `fartDetailsApi.getById` | `GET /api/fart-events/{id}` | `FartEventsController.GetById` | `IFartEventReadService.GetByIdAsync` | Route connected |
| `fartDetailsApi.setVisibility` | `POST /api/fart-events/{id}/visibility` | `FartEventsController.UpdateVisibility` | `IFartEventService.UpdateVisibilityAsync` | Route connected; frontend can fake success |
| `fartDetailsApi.react` | `POST /api/fart-events/{id}/react` | `FartEventsController.React` | `IFartEventService.ReactAsync` | Route connected; frontend can fake success |
| `feedApi.getFeed` | `GET /api/feed` | `FeedController.GetFeed` | `ISocialService.GetFeedAsync` | Route connected |
| `feedApi.react` | `POST /api/fart-events/{id}/react` | `FartEventsController.React` | `IFartEventService.ReactAsync` | Route connected |
| `friendsApi.getFriends` | `GET /api/friends` | `FriendsController.GetFriends` | `ISocialService.GetFriendsAsync` | Route connected |
| `friendsApi.getRequests` | `GET /api/friends/requests` | `FriendsController.GetRequests` | `ISocialService.GetFriendRequestsAsync` | Route connected |
| `friendsApi.requestFriend` | `POST /api/friends/{userId}/request` | `FriendsController.RequestFriend` | `ISocialService.RequestFriendAsync` | Route connected; accepts GUID only |
| `friendsApi.acceptRequest` | `POST /api/friends/{requestId}/accept` | `FriendsController.AcceptFriendRequest` | `ISocialService.AcceptFriendRequestAsync` | Route connected |
| `friendsApi.declineRequest` | `DELETE /api/friends/requests/{requestId}` | `FriendsController.RejectFriendRequest` | `ISocialService.RejectFriendRequestAsync` | Route connected |
| `friendsApi.removeFriend` | `DELETE /api/friends/{userId}` | `FriendsController.DeleteFriend` | `ISocialService.DeleteFriendAsync` | Route connected |
| `historyApi.getMyHistory` | `GET /api/fart-events/my-history` | `FartEventsController.GetMyHistory` | `IFartEventReadService.GetMyHistoryAsync` | Route connected |
| `inventoryApi.getInventory` | `GET /api/inventory` | `InventoryController.GetMyInventory` | `IInventoryService.GetMyInventoryAsync` | Route connected |
| `inventoryApi.equipItem` | `POST /api/inventory/{itemId}/equip` | `InventoryController.Equip` | `IInventoryService.EquipAsync` | Route connected |
| `leaderboardsApi.getGlobal` | `GET /api/leaderboards/global` | `LeaderboardsController.GetGlobal` | `ILeaderboardService.GetGlobalAsync` | Route connected |
| `leaderboardsApi.getFriends` | `GET /api/leaderboards/friends` | `LeaderboardsController.GetFriends` | `ILeaderboardService.GetFriendsAsync` | Route connected |
| `profileApi.getProfile` | `GET /api/me` | `MeController.GetMe` | `IAuthService.GetMeAsync` | Route connected; response is identity-only |
| `profileApi.getWallet` | `GET /api/wallet` | `WalletController.GetWallet` | `IEconomyService.GetWalletAsync` | Route connected |
| `shopApi.getLootboxes` | `GET /api/lootboxes` | `LootBoxesController.GetAll` | `ILootBoxService.GetAllAsync` | Route connected |
| `shopApi.openLootbox` | `POST /api/lootboxes/{id}/open` | `LootBoxesController.Open` | `ILootBoxService.OpenAsync` | Route connected; frontend can fake success |

## Blocking Connection Problems

1. **No authentication/session flow**

   All social-app backend routes are protected by `[Authorize]`. The backend exposes register, login, refresh, and logout routes, but FartTag Social calls none of them. `setApiAccessToken` is exported but never used. Therefore every declared app request is sent without a bearer token and receives `401 Unauthorized`.

2. **BLE event upload sends an invalid backend device ID**

   The detection store uses `FT-SOCIAL-DEMO-01`, while `CreateFartEventRequestDto.DeviceId` is `Guid?`. A BLE upload is rejected during model binding because the value is not a GUID. Even a valid GUID must refer to an active device ownership for the authenticated user.

3. **Mock fallback IDs are not backend IDs**

   Mock events, friends, inventory items, and loot boxes use values such as `fart-best-001` and `lootbox-rare`. Backend route parameters are constrained with `{id:guid}`. Actions performed on fallback content therefore return `404` before reaching a controller action.

4. **Backend failures are hidden**

   Most read APIs catch every error and return mock data. `fartDetailsApi.setVisibility`, `fartDetailsApi.react`, and `shopApi.openLootbox` can also return mock success after a failed mutation. The UI can claim a visibility change, reaction, or purchase happened when no backend state changed.

## Visible Actions Without Backend Calls

| App capability | Current behavior | Backend support |
| --- | --- | --- |
| Login, register, refresh, logout | No UI or API client | Backend routes exist |
| Feed comments | Shows placeholder alert | Backend create-comment and comment-list routes exist; feed comment UI remains unfinished |
| Public user profile | Loads the backend profile, with route parameters as visual fallback | Backend profile route exists |
| Following feed | Always empty | No following backend model or route |
| Friend search by username | Add action resolves exact usernames through backend search; search panel still uses local loaded data | Backend user-search route exists |
| Challenge friend | Shows success alert only | No challenge backend model or route |
| QR friend scan/invite link | Placeholder alerts | No backend route |
| Recent social activity and friend stats | Generated locally | No backend route |
| Shop boosts/special offers | Shows purchase success alert only | No offers/purchases backend route |
| Shop packs/resources/daily offers | Placeholder panels | No backend route |
| Device connect and BLE stream | Simulated locally | Device register/list/get routes exist but are unused |
| Profile settings | Static labels | No settings backend route |
| Public feed audio replay | Connected when an event has an audio file | Backend feed response includes replay URL |
| Fart detail comments | Connected for display and API-level create/list operations | Comment composer UI remains unfinished |
| Gems and XP header values | Local Zustand defaults | No social-app backend calls |
| Wallet transactions | Not shown or called | Backend route exists |

## Backend Routes Not Used By FartTag Social

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/devices/register`
- `GET /api/devices/my`
- `GET /api/devices/{id}`
- `GET /api/fart-events/audio/{id}` is opened as a URL, not requested through `apiRequest`
- `GET /api/wallet/transactions`
- All `/api/admin/*` routes, intentionally

## Recommended Connection Order

1. Add a real auth/session bootstrap and set/refresh the API bearer token.
2. Stop returning mock success for mutations; expose backend failures to stores and UI.
3. Register/select backend devices and upload their GUIDs for BLE events.
4. Separate demo/mock mode from connected mode so mock IDs cannot reach GUID routes.
5. Add user search and public profile backend contracts.
6. Connect comments and include comment/audio data in feed/detail responses.
7. Implement or clearly disable unfinished challenge, following, offers, settings, QR, XP, and gems actions.
