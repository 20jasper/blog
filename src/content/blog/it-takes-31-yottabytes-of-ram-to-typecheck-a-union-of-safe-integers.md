---
title: 'It takes 31 yottabytes of RAM to typecheck a union of Safe Integers'
pubDate: '2025-08-17'
description: 'Do It'
math: true
---

First of all, before you smelly nerds start complaining, I know this benchmark means literally nothing—I just did it for fun. I will qualify as much as possible and share my methods, but I'm sure they aren't perfect, nor do my measurements say anything particularly important

Second of all, let's make the title more specific. It theoretically would take 315 zettabytes of disk to hold a TypeScript file with a union of Safe Integers in TypeScript. Safe Integers are defined as `Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER` inclusive, or $$[-(2^{53} - 1), 2^{53} - 1]$$

To typecheck this file using TSC 5.9.2 (`tsc --noEmit safe-integer.ts`), this would theoretically require 31 yottabytes of RAM

## Uhhh what is a yottabyte??????

What is a Yottabyte? That's 1,000,000,000,000,000,000,000,000 (1 septillion) bytes, or 1 trillion terabytes, or 1 trillion trillion bytes. I don't know about you, but I don't have that much RAM on my computer. If anyone has an extra 31 yottabytes of RAM laying around collecting dust, let me know!

## Specs

My computer has 12 logical processors and 64 GB of RAM. This test was run on WSL using Ubuntu 20.04.6 LTS and afforded 48GB of RAM

```
Processor	AMD Ryzen 5 5600X 6-Core Processor                3.70 GHz
Installed RAM	64.0 GB
Storage	932 GB SSD CT1000T500SSD8, 954 GB SSD SPCC M.2 PCIe SSD
Graphics Card	AMD Radeon RX 6600 (8 GB)
```

## Pretty graphs

## Is there even enough storage in the world?

According to Business Wire's report on the IDC's Global StorageSphere forecast[^costsTooManyDollars], the amount of data being stored globally is <quote>expected to grow to 8.9ZB by 2024</quote>. The `SafeInteger` union would take 315 ZB, or around 35x that number. Maybe in 20 years I'll ask everyone to pool their storage space for the sake of type safety!

[^costsTooManyDollars]: I am using Business Wire as a Proxy since the actual report costs 7500$ 😭

## Just Download more RAM

Back in the day, gramma tried to jailbreak their VCR, but they accidentally downloaded infinite ram. They scrambled to hit the internet shutoff valve, but it was too late. They opened up task manager and it showed 1 yottabyte of RAM

Grandpa turned on Nord VPN to buy some time, but depleting the world's RAM supply has dire ramifications

> ERROR: NORDVPN ULTIMATE REQUIRED FOR RAM-EVADE MANEUVERS. YOU HAVE 3 MINUTES BEFORE IP LEAK

Grandma was never seen again, and their steam account was completely wiped

Don't risk it—use an untraceable method like stealing RAM sticks from the library, and if you need lots of RAM, you ought buy it
