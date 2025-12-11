# Changelog

## [4.8.7](///compare/v4.8.6...v4.8.7) (2025-12-11)

### Bug Fixes

* override conventional-changelog-conventionalcommits ([#178](https://github.com/kiegroup/git-backporting/issues/178)) ([42d5ca8](https://github.com/kiegroup/git-backporting/commit/42d5ca8288b2af94b1d47f7fe5cb153ae2480822))
* throw error when trying to backport single undefined commit ([#177](https://github.com/kiegroup/git-backporting/issues/177)) ([39b6b15](https://github.com/kiegroup/git-backporting/commit/39b6b1515be29d0fc5b48f2a85342217e3c22ce8))

## <small>4.8.6 (2025-09-04)</small>

* ci: bump node version to 20 for ci workflows (#161) ([c5ce1d4](https://github.com/kiegroup/git-backporting/commit/c5ce1d4)), closes [#161](https://github.com/kiegroup/git-backporting/issues/161)
* build: audit fix (#159) ([8f0df7b](https://github.com/kiegroup/git-backporting/commit/8f0df7b)), closes [#159](https://github.com/kiegroup/git-backporting/issues/159)
* build(deps): bump form-data from 4.0.0 to 4.0.4 (#158) ([83a65d8](https://github.com/kiegroup/git-backporting/commit/83a65d8)), closes [#158](https://github.com/kiegroup/git-backporting/issues/158)
* build(deps): bump tmp and @inquirer/editor (#160) ([8c412dc](https://github.com/kiegroup/git-backporting/commit/8c412dc)), closes [#160](https://github.com/kiegroup/git-backporting/issues/160)
* build(deps): bump undici, @release-it/conventional-changelog and release-it (#157) ([8625efa](https://github.com/kiegroup/git-backporting/commit/8625efa)), closes [#157](https://github.com/kiegroup/git-backporting/issues/157)

## <small>4.8.5 (2025-04-15)</small>

* build(deps): audit fix (#150) ([3a9d367](https://github.com/kiegroup/git-backporting/commit/3a9d367)), closes [#150](https://github.com/kiegroup/git-backporting/issues/150)
* build(deps): upgrade release-it to v18 (#153) ([c9a7375](https://github.com/kiegroup/git-backporting/commit/c9a7375)), closes [#153](https://github.com/kiegroup/git-backporting/issues/153)
* fix(#151): fix gitlab post comments url (#152) ([d74a787](https://github.com/kiegroup/git-backporting/commit/d74a787)), closes [#152](https://github.com/kiegroup/git-backporting/issues/152)

## [4.8.4](https://github.com/kiegroup/git-backporting/compare/v4.8.3...v4.8.4) (2024-11-02)


### Bug Fixes

* abort conflicting cherry-pick before starting new one ([#146](https://github.com/kiegroup/git-backporting/issues/146)) ([3deee59](https://github.com/kiegroup/git-backporting/commit/3deee59d4c3b726ae131b5974af4618dd5e7d1d2))

## [4.8.3](https://github.com/kiegroup/git-backporting/compare/v4.8.2...v4.8.3) (2024-10-10)


### Bug Fixes

* auto-no-squash inference for GitLab ([#140](https://github.com/kiegroup/git-backporting/issues/140)) ([b4d0481](https://github.com/kiegroup/git-backporting/commit/b4d0481c5649115367f1ae0724d12d55b6b86e10))

## [4.8.2](https://github.com/kiegroup/git-backporting/compare/v4.8.1...v4.8.2) (2024-10-07)


### Bug Fixes

* cherry-pick order on GitLab by reversing commmit list only once ([#137](https://github.com/kiegroup/git-backporting/issues/137)) ([e2d73d0](https://github.com/kiegroup/git-backporting/commit/e2d73d050c8387c0858877ac3c56c565bacaf4f9))
* handle Codeberg returning null entry in requested_reviewers ([#136](https://github.com/kiegroup/git-backporting/issues/136)) ([1e8358b](https://github.com/kiegroup/git-backporting/commit/1e8358bb2c461c56cf86e82bec4d71284866b13b))

## [4.8.1](https://github.com/kiegroup/git-backporting/compare/v4.8.0...v4.8.1) (2024-07-16)


### Bug Fixes

* **gh130:** apply commits in the correct order on github ([#131](https://github.com/kiegroup/git-backporting/issues/131)) ([cb3473d](https://github.com/kiegroup/git-backporting/commit/cb3473d7c9de66cb7bec188f08538e134cdc4bc0))

## [4.8.0](https://github.com/kiegroup/git-backporting/compare/v4.7.1...v4.8.0) (2024-04-11)


### Features

* auto-detect the value of the no-squash option ([#118](https://github.com/kiegroup/git-backporting/issues/118)) ([6042bcc](https://github.com/kiegroup/git-backporting/commit/6042bcc40ba83593a23dfe4d92cf50655a05b1cd))
* implement error notification as pr comment ([#124](https://github.com/kiegroup/git-backporting/issues/124)) ([2bb7f73](https://github.com/kiegroup/git-backporting/commit/2bb7f731127e099d1f196e6785e992589f7c4940))

## [4.7.1](https://github.com/kiegroup/git-backporting/compare/v4.7.0...v4.7.1) (2024-04-03)


### Bug Fixes

* gha input is target-branch-pattern, not target-reg-exp ([#120](https://github.com/kiegroup/git-backporting/issues/120)) ([e6f86f8](https://github.com/kiegroup/git-backporting/commit/e6f86f8f839bc86adf36fa0d3c8dcad6cab2f92e))

## [4.7.0](https://github.com/kiegroup/git-backporting/compare/v4.6.0...v4.7.0) (2024-04-02)


### Features

* add --cherry-pick-options to add to all cherry-pick run ([#116](https://github.com/kiegroup/git-backporting/issues/116)) ([fe6be83](https://github.com/kiegroup/git-backporting/commit/fe6be83074476d91c1b038fd7f03c4868e96f113))
* **gh75:** extract target branched from pr labels ([#112](https://github.com/kiegroup/git-backporting/issues/112)) ([53cc505](https://github.com/kiegroup/git-backporting/commit/53cc505f17630fb30daa70f75895323325cc0c7d))


### Bug Fixes

* return GitHub no-squash commits in order ([#115](https://github.com/kiegroup/git-backporting/issues/115)) ([6d9b9db](https://github.com/kiegroup/git-backporting/commit/6d9b9db590f9713e2b056bcc8e20fc3f3c70618b))

## [4.6.0](https://github.com/kiegroup/git-backporting/compare/v4.5.2...v4.6.0) (2024-03-25)


### Features

* add --git-client to explicitly set the type of forge ([#106](https://github.com/kiegroup/git-backporting/issues/106)) ([80a0b55](https://github.com/kiegroup/git-backporting/commit/80a0b554f0c1920a178e28bd678f709581a1b224))

## [4.5.2](https://github.com/kiegroup/git-backporting/compare/v4.5.1...v4.5.2) (2024-03-08)

### Improvements

* upgrade to node20 for gha ([c8ede8d](https://github.com/kiegroup/git-backporting/commit/c8ede8d4e2428cb3f4dc2d727f24b37e5781cbb1))

## [4.5.1](https://github.com/kiegroup/git-backporting/compare/v4.5.0...v4.5.1) (2024-02-23)


### Bug Fixes

* --auth when --git-user contains space ([#95](https://github.com/kiegroup/git-backporting/issues/95)) ([9bcd6e6](https://github.com/kiegroup/git-backporting/commit/9bcd6e6b5547974c45ade756b623eb385bb76019))
* --no-squash on single-commit GitLab MR ([#93](https://github.com/kiegroup/git-backporting/issues/93)) ([300fa91](https://github.com/kiegroup/git-backporting/commit/300fa91a8ae065b7f6f6370882b10929bbde6309))
* **gh-96:** fix git token parsing ([#98](https://github.com/kiegroup/git-backporting/issues/98)) ([c57fca6](https://github.com/kiegroup/git-backporting/commit/c57fca6bd6b9c241c11ad1f728cc9bc0acfd7f88))

## [4.5.0](https://github.com/kiegroup/git-backporting/compare/v4.4.1...v4.5.0) (2023-12-10)


### Features

* **gh-85:** take git tokens from environment ([#88](https://github.com/kiegroup/git-backporting/issues/88)) ([70da575](https://github.com/kiegroup/git-backporting/commit/70da575afce603190eafed927637922a37fbd087))

## [4.4.1](https://github.com/kiegroup/git-backporting/compare/v4.4.0...v4.4.1) (2023-12-05)


### Bug Fixes

* namespace parsing in gitlab ([#84](https://github.com/kiegroup/git-backporting/issues/84)) ([ed32d22](https://github.com/kiegroup/git-backporting/commit/ed32d2275b6008d31e456c41beecd536eceb23dc))

## [4.4.0](https://github.com/kiegroup/git-backporting/compare/v4.3.0...v4.4.0) (2023-08-18)


### Features

* integrate with codeberg ([#80](https://github.com/kiegroup/git-backporting/issues/80)) ([9f0fbc0](https://github.com/kiegroup/git-backporting/commit/9f0fbc0b2fd8d449207660323be87f6d2fa8c017))
* **issue-77:** handle multiple target branches ([#78](https://github.com/kiegroup/git-backporting/issues/78)) ([5fc72e1](https://github.com/kiegroup/git-backporting/commit/5fc72e127bedb3177f4e17ff1182827c78154ef1))

## [4.3.0](https://github.com/kiegroup/git-backporting/compare/v4.2.0...v4.3.0) (2023-07-27)


### Features

* **issue-70:** additional pr comments ([bed7e29](https://github.com/kiegroup/git-backporting/commit/bed7e29ddc1ba5498faa2c7cc33ec3b127947dcf))


### Bug Fixes

* gha skip whitespace trim on body ([#73](https://github.com/kiegroup/git-backporting/issues/73)) ([29589a6](https://github.com/kiegroup/git-backporting/commit/29589a63b503b30820a13a442de533239dec06f4))
* preserve new lines in body and comments ([#72](https://github.com/kiegroup/git-backporting/issues/72)) ([fa43ffc](https://github.com/kiegroup/git-backporting/commit/fa43ffc1dc5572a06309c28e93ee6ab5fba14780))

## [4.2.0](https://github.com/kiegroup/git-backporting/compare/v4.1.0...v4.2.0) (2023-07-13)


### Features

* **issue-62:** make cherry-pick strategy configurable ([#63](https://github.com/kiegroup/git-backporting/issues/63)) ([265955d](https://github.com/kiegroup/git-backporting/commit/265955dda77a8191fd1f64517fec20e8d5f8c5b4))


### Bug Fixes

* **issue-57:** truncate the bp branch name ([#58](https://github.com/kiegroup/git-backporting/issues/58)) ([ead1322](https://github.com/kiegroup/git-backporting/commit/ead1322c0f6bb5de96c487e8f6b6565734144853))


### Performance Improvements

* use concurrent promises instead of awaiting them one by one ([#59](https://github.com/kiegroup/git-backporting/issues/59)) ([49a7350](https://github.com/kiegroup/git-backporting/commit/49a73504066396ca2a074f55bb23815e13ae462e))

## [4.1.0](https://github.com/kiegroup/git-backporting/compare/v4.0.0...v4.1.0) (2023-07-11)


### Features

* **issue-41:** set and inherit labels ([#48](https://github.com/kiegroup/git-backporting/issues/48)) ([fcc0167](https://github.com/kiegroup/git-backporting/commit/fcc01673f4bc9aa2786faf6dfd503a29e5ca0cd9))
* **issue-54:** backport pr commits without squash ([#55](https://github.com/kiegroup/git-backporting/issues/55)) ([c4dbb26](https://github.com/kiegroup/git-backporting/commit/c4dbb26c1d9d266ed86f3f0d6016b8cff7743f8b))


### Bug Fixes

* **issue-52:** use pull request github api url as source ([#53](https://github.com/kiegroup/git-backporting/issues/53)) ([a737aa7](https://github.com/kiegroup/git-backporting/commit/a737aa7c4c66983de358b8472121ab918de922e3))

## [4.0.0](https://github.com/kiegroup/git-backporting/compare/v3.0.0...v4.0.0) (2023-07-06)

Project moved under @kiegroup organization.

## [3.1.1](https://github.com/kiegroup/git-backporting/compare/v3.1.0...v3.1.1) (2023-07-06)

## [3.1.0](https://github.com/kiegroup/git-backporting/compare/v3.0.0...v3.1.0) (2023-07-05)


### Features

* config file as option ([#42](https://github.com/kiegroup/git-backporting/issues/42)) ([5ead31f](https://github.com/kiegroup/git-backporting/commit/5ead31f606b585ecdf7ed2e9de8ebd841b935898))

## [3.0.0](https://github.com/kiegroup/git-backporting/compare/v2.2.1...v3.0.0) (2023-07-01)


### Features

* integrate tool with gitlab service ([#39](https://github.com/kiegroup/git-backporting/issues/39)) ([107f5e5](https://github.com/kiegroup/git-backporting/commit/107f5e52d663157145aa14f6cf7fa4d6704cb844))


### Bug Fixes

* removed 'powered by..' pr body suffix ([6869bec](https://github.com/kiegroup/git-backporting/commit/6869becb3e5979b24f6fe29bf38141e15c1bdc66))

## [2.2.1](https://github.com/kiegroup/git-backporting/compare/v2.2.0...v2.2.1) (2023-06-27)


### Bug Fixes

* fix gha no-inherit-reviewers input ([8b586cc](https://github.com/kiegroup/git-backporting/commit/8b586ccdfe0e6b90ed41ea8a5eecdbc24893fe25))

## [2.2.0](https://github.com/kiegroup/git-backporting/compare/v2.1.0...v2.2.0) (2023-06-22)


### Features

* override backporting pr fields ([#38](https://github.com/kiegroup/git-backporting/issues/38)) ([a32e8cd](https://github.com/kiegroup/git-backporting/commit/a32e8cd34c757358668fe8f88f6d1733d3fa8391))

## [2.1.0](https://github.com/kiegroup/git-backporting/compare/v2.0.1...v2.1.0) (2023-06-20)


### Features

* **issue-17:** override backporting pr data ([#29](https://github.com/kiegroup/git-backporting/issues/29)) ([941beda](https://github.com/kiegroup/git-backporting/commit/941beda208e4a8c1577bd4d39299fbbfbf569c06))


### Bug Fixes

* gha input parser ([95b35aa](https://github.com/kiegroup/git-backporting/commit/95b35aa4efb86e2bc4990d920feec1ec5c4eb8e4))

## [2.0.1](https://github.com/kiegroup/git-backporting/compare/v2.0.0...v2.0.1) (2023-01-05)

## [2.0.0](https://github.com/kiegroup/git-backporting/compare/v1.0.0...v2.0.0) (2023-01-05)


### Features

* backport still open pull requests ([b3936e0](https://github.com/kiegroup/git-backporting/commit/b3936e019a19976281c5e2582904264e974b8b42))
* pull request backporting ([b3936e0](https://github.com/kiegroup/git-backporting/commit/b3936e019a19976281c5e2582904264e974b8b42))
