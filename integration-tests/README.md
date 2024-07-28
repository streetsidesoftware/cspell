# Integration Tests

Cspell uses integration tests to verify that changes to the tools, libraries, and dictionaries did not break existing / expected behavior.

## How It Works

1. The Integration Test makes a local copy of the repository to be tested
1. The cspell tool is run against the local copy
1. The result is compared against a snapshot

## Two types of Integration Tests

1. Historical - against a fixed commit of a repository, the integration is used to track improvements to cspell over time.
1. Active - targets repositories that actively use cspell to address spelling issues, the integration is used to verify
   cspell works as expected against the repository.
   Checking against `main` should be possible

Currently, only Historical tests are supported. Active tests are possible, but would need changes to the testing tool.

## Integration Repositories

Repositories are choose to be representative of public domain code bases and programming languages.

### Repository Criteria

1. Must be in the public domain
1. Must support Git
1. Should match some of the following:
   1. Primarily contains files that cspell supports or will support
   1. Currently uses cspell (this is a nice to have but not a requirement)
   1. Contains a lot of false positives (we want to get that number down over time)
   1. Can be checked in a reasonable amount of time.

## How to add an Integration

### Steps

1. Add the repository: `./tester.js add https://github.com/<owner>/<repository>.git -t $(gh auth token)`
1. Adjust the arguments in: `config/config.json`
1. Create a snapshot: `./tester.js check -u <owner/repository>`
1. Verify the snapshot: `snapshots/owner/repository/snapshot.txt`
   Contains the normalized output of the cspell command.
1. Run the tester against the snapshot: `./tester.js check <owner/repository>`
1. When read, add it to the matrix in: `/.github/workflows/integration-test.yml`

The tester will make a local copy of the repository in `repositories/<owner>/<repository>` and add the
repository to `config/config.json`.

## How to fix a broken test

As cspell improves, the results of the snapshot will change over time. This is especially true for false positives. Dictionary and parsing improvements should cause
incremental changes to the snapshot.

To fix a broken snapshot:

```
./tester.js check -u <owner/repository>
```

To regenerate ALL snapshots (this can take a LOT of time):

```
./tester.js check -u
```
