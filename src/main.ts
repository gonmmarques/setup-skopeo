import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { getDownloadURL, getLatestVersion } from './utils'

const VERSION_INPUT = 'version'
const LATEST = 'latest'
const TOOL_NAME = 'skopeo'
const TOOL_DIR_PREFIX = `${TOOL_NAME}-`
const EXECUTABLE_MODE = 0o755

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    let version = core.getInput(VERSION_INPUT)
    if (version === LATEST) {
      version = await getLatestVersion()
      core.debug(`Latest version of skopeo is ${version}`)
    }
    core.info(`Version to be installed: ${version}`)

    const toolDir = fs.mkdtempSync(path.join(os.tmpdir(), TOOL_DIR_PREFIX))
    const toolPath = path.join(toolDir, TOOL_NAME)

    await tc.downloadTool(getDownloadURL(version), toolPath)

    await fs.promises.chmod(toolPath, EXECUTABLE_MODE)

    core.addPath(toolDir)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
