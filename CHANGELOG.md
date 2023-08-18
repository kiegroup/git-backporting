# Changelog

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