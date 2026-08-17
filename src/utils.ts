import os from 'os'
import https from 'https'

const supportedPlatform = ['darwin', 'linux']
const supportedArch = ['amd64', 'arm64']
const archAlias: Record<string, string> = {
  x64: 'amd64'
}
const defaultVersionURL =
  'https://raw.githubusercontent.com/lework/skopeo-binary/master/version.txt'

export function getDownloadURL(
  version: string,
  platform: string = os.platform(),
  arch: string = os.arch()
): string {
  if (!supportedPlatform.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  const aliasedArch = archAlias[arch] || arch
  if (!supportedArch.includes(aliasedArch)) {
    throw new Error(`Unsupported arch: ${arch}`)
  }

  return `https://github.com/lework/skopeo-binary/releases/download/${version}/skopeo-${platform}-${aliasedArch}`
}

export async function getSupportedVersions(
  url: string = defaultVersionURL
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (!res) {
          reject(new Error('No response received'))
          return
        }

        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          resolve(data.trim().split('\n').filter(Boolean))
        })

        res.on('error', err => {
          reject(err)
        })
      })
      .on('error', reject)
  })
}

export async function getLatestVersion(
  versionProvider: () => Promise<string[]> = getSupportedVersions
): Promise<string> {
  const versions = await versionProvider()
  if (versions.length === 0) {
    throw new Error('No versions found')
  }
  return versions[versions.length - 1]
}
