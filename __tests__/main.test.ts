import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { run } from '../src/main'
import * as utils from '../src/utils'

describe('main.run', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(core, 'getInput').mockReturnValue('v1.2.3')
    jest.spyOn(core, 'debug').mockImplementation()
    jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(core, 'addPath').mockImplementation()
    jest.spyOn(core, 'setFailed').mockImplementation()
    jest.spyOn(tc, 'downloadTool').mockResolvedValue('/tmp/skopeo')
    jest
      .spyOn(utils, 'getDownloadURL')
      .mockReturnValue('https://example.com/skopeo-v1.2.3')
  })

  it('downloads the specified version and adds it to PATH', async () => {
    await run()

    expect(core.getInput).toHaveBeenCalledWith('version')
    expect(utils.getDownloadURL).toHaveBeenCalledWith('v1.2.3')
    expect(tc.downloadTool).toHaveBeenCalledWith(
      'https://example.com/skopeo-v1.2.3',
      './skopeo'
    )
    expect(core.addPath).toHaveBeenCalledWith('./skopeo')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('resolves the latest version when the input is latest', async () => {
    jest.spyOn(core, 'getInput').mockReturnValue('latest')
    jest.spyOn(utils, 'getLatestVersion').mockResolvedValue('v2.0.0')

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
    jest.spyOn(utils, 'getLatestVersion').mockRejectedValue(new Error('nope'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('nope')
  })
})
