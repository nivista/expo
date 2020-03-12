import { Changelog, ChangelogChanges } from '../Changelogs';
import { GitLog, GitFileLog, GitDirectory } from '../Git';
import { PackageViewType } from '../Npm';
import { Package } from '../Packages';
import { BACKUPABLE_OPTIONS_FIELDS } from './constants';

/**
 * Command's options.
 */
export type CommandOptions = {
  packageNames: string[];
  prerelease: boolean | string;
  exclude: string[];
  tag: string;
  retry: boolean;
  commitMessage: string;
  excludeDeps: boolean;
  skipRepoChecks: boolean;
  dry: boolean;

  /* exclusive options that affect what the command does */
  listUnpublished: boolean;
  promote: boolean | string;
  backport: boolean | string;
  grantAccess: boolean;
};

/**
 * CommandOptions without options that aren't backupable or just don't matter when restoring a backup.
 */
export type BackupableOptions = Pick<CommandOptions, typeof BACKUPABLE_OPTIONS_FIELDS[number]>;

/**
 * Represents command's backup data.
 */
export type PublishBackupData = {
  head: string;
  options: BackupableOptions;
  state: {
    [key: string]: PublishState;
  };
};

export type PublishState = {
  /**
   * Whether the package has any unpublished changes (commits) since last publish.
   */
  hasUnpublishedChanges?: boolean;

  /**
   * Whether the user selected this package to be published.
   */
  isSelectedToPublish?: boolean;

  /**
   * Provides informations about changelog changes that have been added since last publish.
   */
  changelogChanges?: ChangelogChanges;

  /**
   * Boolean value whether the package passed integrity checks.
   */
  integral?: boolean;

  /**
   * Object that contains a list of commits and changed files since last publish.
   */
  logs?: PackageGitLogs;

  /**
   * This is the smallest possible release type that we can use.
   * It depends only on changes within this package.
   */
  minReleaseType?: ReleaseType;

  /**
   * The final release type that also takes into account release types of the dependencies.
   *
   * Example: Package A depends only on package B and package B has no dependencies.
   * If `minReleaseType` of package A is `patch` and `minor` in package B, then `releaseType` of A is `minor`
   * because it's higher than `patch`.
   */
  releaseType?: ReleaseType;

  /**
   * The final suggested version to publish. Resolved based on `releaseType`.
   */
  releaseVersion?: string | null;

  /**
   * Property that is set to `true` once the parcel finishes publishing to NPM registry.
   */
  published?: boolean;
};

/**
 * Type of objects that are being passed through command's tasks.
 * It's kind of a wrapper for all data related to the package.
 */
export type Parcel<State = PublishState> = {
  /**
   * Package instance that stores `package.json` object and some other useful data.
   */
  pkg: Package;

  /**
   * JSON object representing the result of `npm view` command run for the package.
   * Can be `null` if package is not published yet.
   */
  pkgView: PackageViewType | null;

  /**
   * Changelog instance that can read and modify package changelog.
   */
  changelog: Changelog;

  /**
   * Instance of GitDirectory that runs all git commands from package root directory.
   */
  gitDir: GitDirectory;

  /**
   * Lists of parcels whose package depends on this one.
   */
  dependents: Parcel<State>[];

  /**
   * Lists of parcels on which this parcel depends on.
   */
  dependencies: Parcel<State>[];

  /**
   * Command's tasks should put their results in this object.
   * It's being serialized and saved in the backup after each task.
   */
  state: State;
};

/**
 * Array type representing arguments passed to the tasks.
 */
export type TaskArgs = [Parcel[], CommandOptions];

/**
 * Enum of possible release types. It must be in sync with `semver.ReleaseType` union options.
 */
export enum ReleaseType {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
  PREMAJOR = 'premajor',
  PREMINOR = 'preminor',
  PREPATCH = 'prepatch',
  PRERELEASE = 'prerelease',
}

/**
 * Type of the action. Certain command options may affect the action type.
 */
export enum ActionType {
  PUBLISH = 'publish',
  LIST = 'list',
  PROMOTE = 'promote',
  BACKPORT = 'backport',
}

/**
 * Object containing git logs. `null` if logs couldn't be resolved due to corrupted package data.
 */
export type PackageGitLogs = null | {
  commits: GitLog[];
  files: GitFileLog[];
};
