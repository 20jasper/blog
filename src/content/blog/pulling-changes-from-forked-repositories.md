---
title: 'Pulling changes from forked repositories'
pubDate: 'Dec 30 2022'
description: "Imagine this—you are working on a feature in an open–source GitHub repo with a few others. You don't have write access, so you will need to make forks. If everyone is comfortable, one person can make a fork and give everyone else write access, but that's not always the easy to coordinate"
---

## Table of contents

- [Table of contents](#table-of-contents)
- [Intro](#intro)
- [Remotes](#remotes)
  - [Checking remotes](#checking-remotes)
  - [Adding new remotes](#adding-new-remotes)
- [Fetching changes](#fetching-changes)
- [Merging changes](#merging-changes)
- [Conclusion](#conclusion)

## Intro

Imagine this—you are working on a feature in an open–source GitHub repo with a few others. You don't have write access, so you will need to make forks. If everyone is comfortable, one person can make a fork and give everyone else write access, but that's not always the easy to coordinate.

## Remotes

Your teammate just pushed some changes, how can you pull them into your own fork?

First we need to set up a remote repository, or for short, a remote. This will allow you to interact with other repositories—in this case, your teammates'.

### Checking remotes

If you are unsure which remotes you've already added, you can always check with this command

```bash
$ git remote -v
origin	https://github.com/20jasper/git-tutorial (fetch)
origin	https://github.com/20jasper/git-tutorial (push)
```

Note that origin isn't a special keyword—it's just the default name for a repo's main remote

### Adding new remotes

Typing out the whole url for a remote every time would be confusing, but luckily, each remote can be given a name just like `origin`.

Let's say our teammate is called Jimothy, and to keep it simple, let's use `jimothy` for the name of the remote as well.

```bash
$ git remote add jimothy https://github.com/jimothy/git-tutorial
```

Just to be safe, let's check the remotes.

```bash
$ git remote -v
jimothy	https://github.com/jimothy/git-tutorial (fetch)
jimothy	https://github.com/jimothy/git-tutorial (push)
origin	https://github.com/20jasper/git-tutorial (fetch)
origin	https://github.com/20jasper/git-tutorial (push)
```

Great—everything worked! Now you just need to fetch and merge the changes and you're set.

## Fetching changes

To sync the changes made in a remote, run `git fetch <remote>`

```bash
$ git fetch jimothy
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), 639 bytes | 106.00 KiB/s, done.
From https://github.com/jimothy/git-tutorial
 * [new branch]      main       -> jimothy/main
```

## Merging changes

At this point, both versions can be merged.

```bash
$ git merge jimothy/main
Updating 875fc67..b7568a9
```

## Conclusion

Congratulations You have successfully combined both your work and your teammate's!
