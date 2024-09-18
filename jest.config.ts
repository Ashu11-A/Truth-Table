// jest.config.ts
import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest'
import { defaults } from 'jest-config'

const defaultEsmPreset = createDefaultEsmPreset()

const jestConfig: JestConfigWithTsJest = {
  ...defaultEsmPreset,
  moduleDirectories: [...defaults.moduleDirectories, 'bower_components'],
  verbose: true,
  bail: 1,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}

export default jestConfig