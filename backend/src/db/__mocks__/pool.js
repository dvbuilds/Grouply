// Jest auto-mock for '../src/db/pool' — every test file that needs DB-free
// routes calls jest.mock('../src/db/pool') and then configures `query`
// per-test via `pool.query.mockResolvedValueOnce(...)`.
module.exports = {
  query: jest.fn(),
  connect: jest.fn(),
};
