# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

  <!-- ### Removed -->

### Added

- Add `useLayoutEffect` and improve update scheduling ([#28](https://github.com/wtnbass/fuco/pull/28), [#30](https://github.com/wtnbass/fuco/pull/30))

### Fixed

- Fix `useCallback` typing.[#29](https://github.com/wtnbass/fuco/pull/29)

## [1.1.0] - 2019-09-06

### Changed

- Allows css tag as the argument of `useStyle`.([#27](https://github.com/wtnbass/fuco/pull/27))

- Compare as SameValue using `Object.is`. ([#26](https://github.com/wtnbass/fuco/pull/26))

- Effects run every updated if deps is undefined. ([#23](https://github.com/wtnbass/fuco/pull/23))

## [1.0.1] - 2019-08-04

### Changed

- Encapsulation of `Symbol("css")`. ([#22](https://github.com/wtnbass/fuco/pull/22))

### Fixed

- Fix a bug `useEffect` does not work when remounted. ([#20](https://github.com/wtnbass/fuco/pull/20))
