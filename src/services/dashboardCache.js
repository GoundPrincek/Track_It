export const createDashboardCache = (ttlMs = 15000) => {
  const values = new Map();
  const requests = new Map();
  const generations = new Map();
  let globalGeneration = 0;

  const generationFor = (identity) =>
    globalGeneration + (generations.get(identity) || 0);

  const clearIdentity = (identity) => {
    values.delete(identity);
    requests.delete(identity);
    generations.set(identity, (generations.get(identity) || 0) + 1);
  };

  return {
    get(identity, now = Date.now()) {
      const entry = values.get(identity);
      if (!entry || now - entry.fetchedAt >= ttlMs) {
        values.delete(identity);
        return undefined;
      }
      return entry.value;
    },
    set(identity, value, fetchedAt = Date.now()) {
      values.set(identity, { value, fetchedAt });
    },
    getRequest(identity) {
      return requests.get(identity);
    },
    setRequest(identity, request) {
      requests.set(identity, request);
    },
    deleteRequest(identity, request) {
      if (requests.get(identity) === request) requests.delete(identity);
    },
    generation(identity) {
      return generationFor(identity);
    },
    clear(identity) {
      if (identity === undefined) {
        values.clear();
        requests.clear();
        generations.clear();
        globalGeneration += 1;
        return;
      }
      clearIdentity(identity);
    },
    clearUser(userId) {
      const prefix = `${userId}:`;
      const identities = new Set([
        ...values.keys(),
        ...requests.keys(),
        ...generations.keys(),
      ]);
      identities.forEach((identity) => {
        if (identity.startsWith(prefix)) clearIdentity(identity);
      });
    },
  };
};
