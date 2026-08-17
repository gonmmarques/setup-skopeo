/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

describe('index', () => {
  it('calls run when imported', async () => {
    const runMock = jest.fn()
    jest.doMock('../src/main', () => ({ run: runMock }))

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/index')

    expect(runMock).toHaveBeenCalled()
  })
})
