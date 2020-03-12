import path from 'path';
import fs from 'fs-extra';

import { Package } from './Packages';
import { spawnAsync, spawnJSONCommandAsync } from './Utils';
import { EXPO_DIR } from './Constants';

const NATIVE_APPS_PATHS = [EXPO_DIR, path.join(EXPO_DIR, 'apps/bare-expo')];

/**
 * Workspace info for the single project.
 */
export type WorkspaceProjectInfo = {
  location: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
};

/**
 * An object with workspace's projects info.
 */
export type WorkspacesInfo = {
  [key: string]: WorkspaceProjectInfo;
};

/**
 * Returns an object containing info for all projects in the workspace.
 */
export async function getInfoAsync(): Promise<WorkspacesInfo> {
  const info = await spawnJSONCommandAsync('yarn', ['workspaces', 'info', '--json']);
  return JSON.parse(info.data);
}

/**
 * Runs yarn in the root workspace directory.
 */
export async function installAsync(): Promise<void> {
  await spawnAsync('yarn');
}

/**
 * Returns an array of workspace's native apps, like Expo Client or BareExpo.
 */
export function getNativeApps(): Package[] {
  return NATIVE_APPS_PATHS.map((appPath) => new Package(appPath));
}
