import { IncomingMessage } from 'http'
import https from 'https'
import { PassThrough } from 'stream'
import {
  getDownloadURL,
  getLatestVersion,
  getSupportedVersions
} from '../src/utils'

type VersionCallback = (response: IncomingMessage | null) => void

describe('utils', () => {
  describe('getDownloadURL', () => {
    it('returns the correct URL for a supported linux amd64 platform', () => {
      expect(getDownloadURL('v1.2.3', 'linux', 'x64')).toBe(
        'https://github.com/lework/skopeo-binary/releases/download/v1.2.3/skopeo-linux-amd64'
      )
    })

    it('returns the correct URL for a supported darwin arm64 platform', () => {
      expect(getDownloadURL('v1.2.3', 'darwin', 'arm64')).toBe(
        'https://github.com/lework/skopeo-binary/releases/download/v1.2.3/skopeo-darwin-arm64'
      )
    })

    it('throws for an unsupported platform', () => {
      expect(() => getDownloadURL('v1.2.3', 'win32', 'x64')).toThrow(
        'Unsupported platform: win32'
      )
    })

    it('throws for an unsupported architecture', () => {
      expect(() => getDownloadURL('v1.2.3', 'linux', 's390x')).toThrow(
        'Unsupported arch: s390x'
      )
    })
  })

  describe('getSupportedVersions', () => {
    it('parses the manifest into a list of versions', async () => {
      const mockGet: typeof https.get = ((
        _: string,
        callback: VersionCallback
      ) => {
        const response = new PassThrough()
        process.nextTick(() => {
          response.write('v1.0.0\nv1.2.0\nv1.4.0\n')
          response.end()
        })

        callback(response as unknown as IncomingMessage)

        return { on: jest.fn().mockReturnThis() } as unknown as ReturnType<
          typeof https.get
        >
      }) as typeof https.get

      jest.spyOn(https, 'get').mockImplementation(mockGet)

      await expect(
        getSupportedVersions('https://example.com/version.txt')
      ).resolves.toEqual(['v1.0.0', 'v1.2.0', 'v1.4.0'])
    })

    it('rejects when the HTTP response is missing', async () => {
      const mockGet: typeof https.get = ((
        _: string,
        callback: VersionCallback
      ) => {
        callback(null)
        return { on: jest.fn().mockReturnThis() } as unknown as ReturnType<
          typeof https.get
        >
      }) as typeof https.get

      jest.spyOn(https, 'get').mockImplementation(mockGet)

      await expect(
        getSupportedVersions('https://example.com/version.txt')
      ).rejects.toThrow('No response received')
    })

    it('rejects when the HTTP request fails', async () => {
      type RequestMock = {
        on: (event: string, handler: (error: Error) => void) => RequestMock
      }

      const request: RequestMock = {
        on: (event, handler) => {
          if (event === 'error') {
            setImmediate(() => handler(new Error('network failed')))
          }
          return request
        }
      }

      jest
        .spyOn(https, 'get')
        .mockReturnValue(request as unknown as ReturnType<typeof https.get>)

      await expect(
        getSupportedVersions('https://example.com/version.txt')
      ).rejects.toThrow('network failed')
    })
  })

  describe('getLatestVersion', () => {
    it('returns the last version from the supported version list', async () => {
      await expect(
        getLatestVersion(async () => ['v1.0.0', 'v1.2.0', 'v1.4.0'])
      ).resolves.toBe('v1.4.0')
    })

    it('throws when no supported versions are available', async () => {
      await expect(getLatestVersion(async () => [])).rejects.toThrow(
        'No versions found'
      )
    })
  })
})
