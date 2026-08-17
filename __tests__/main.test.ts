import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as utils from '../src/utils'

// Import after mocks are registered
import { run } from '../src/main'

jest.mock('node:fs', () => {
  const actual = jest.requireActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    mkdtempSync: jest.fn(),
    promises: {
      ...actual.promises,
      chmod: jest.fn()
    }
  }
})

jest.mock('node:os', () => {
  const actual = jest.requireActual<typeof import('node:os')>('node:os')
  return {
    ...actual,
    tmpdir: jest.fn()
  }
})

jest.mock('../src/utils', () => ({
  getDownloadURL: jest.fn(),
  getLatestVersion: jest.fn()
}))

describe('main.run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(fs.mkdtempSync).mockReturnValue('/tmp/skopeo-test')
    jest.mocked(os.tmpdir).mockReturnValue('/tmp')
    jest.mocked(fs.promises.chmod).mockResolvedValue(undefined)
    jest.spyOn(core, 'getInput').mockReturnValue('v1.2.3')
    jest.spyOn(core, 'debug').mockImplementation()
    jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(core, 'addPath').mockImplementation()
    jest.spyOn(core, 'setFailed').mockImplementation()
    jest.spyOn(tc, 'downloadTool').mockResolvedValue('/tmp/skopeo-test/skopeo')
    jest
      .mocked(utils.getDownloadURL)
      .mockReturnValue('https://example.com/skopeo-v1.2.3')
  })

  it('downloads the specified version, makes it executable and adds it to PATH', async () => {
    await run()

    expect(core.getInput).toHaveBeenCalledWith('version')
    expect(utils.getDownloadURL).toHaveBeenCalledWith('v1.2.3')
    expect(fs.mkdtempSync).toHaveBeenCalled()
    expect(tc.downloadTool).toHaveBeenCalledWith(
      'https://example.com/skopeo-v1.2.3',
      '/tmp/skopeo-test/skopeo'
    )
    expect(fs.promises.chmod).toHaveBeenCalledWith(
      '/tmp/skopeo-test/skopeo',
      0o755
    )
    expect(core.addPath).toHaveBeenCalledWith('/tmp/skopeo-test')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('resolves the latest version when the input is latest', async () => {
    jest.spyOn(core, 'getInput').mockReturnValue('latest')
    jest.mocked(utils.getLatestVersion).mockResolvedValue('v2.0.0')

    await run()

    expect(utils.getLatestVersion).toHaveBeenCalledTimes(1)
    expect(core.debug).toHaveBeenCalledWith(
      'Latest version of skopeo is v2.0.0'
    )
    expect(core.info).toHaveBeenCalledWith('Version to be installed: v2.0.0')
    expect(utils.getDownloadURL).toHaveBeenCalledWith('v2.0.0')
  })

  it('marks the action as failed when the download fails', async () => {
    jest.spyOn(tc, 'downloadTool').mockRejectedValue(new Error('boom'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('boom')
  })

  it('marks the action as failed when resolving the latest version fails', async () => {
    jest.spyOn(core, 'getInput').mockReturnValue('latest')
    jest.mocked(utils.getLatestVersion).mockRejectedValue(new Error('nope'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('nope')
  })
})
