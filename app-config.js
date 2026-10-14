/* v13 migration compatibility probe.
 * Old v12 PWA clients request ./app-config.js when checking for updates.
 * v13 runtime source of truth is ./js/app-config.js.
 */
globalThis.NIWARA_APP = Object.freeze({
  version: "13.0.3",
  partyLibraryKey: "niwaraBattlePartyLibraryV8",
  teamStorageKey: "niwaraBattleTeamV5"
});
