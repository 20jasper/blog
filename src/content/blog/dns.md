---
title: 'Learn DNS with Garlic Bread'
pubDate: '2025-03-22'
description: 'DNS'
---

<!--
What is a domain
Why is domain authority necessary
What is a TLD
  Who controls them
  Root nameservers
  What is a zone
  What is a registry
How does name resolution work?
DNS records
  common types
 -->

Strap in for an exciting ride—today we'll be talking about DNS and my insatiable desire for garlic bread!

<!-- TODO add image of garlic bread here. Probably the pic I put in playful -->

If you're feeling a bit hungry after seeing this delicious 5 cheese garlic bread, I don't blame you. It's recommended to make some garlic bread before continuing

## What is DNS?

If you've been doing your duolingo, you may say, "this is a blog about programming, what does <span lang="de">Desoxyribonukleinsäure</span> have to do with anything?"

I'm proud you know how to say DNA in German, but your 38 day Duolingo streak won't help here. I'm sorry to say that we are talking about the Domain Name System here, which is very much inorganic[^thatsWhatTheyWantYouToThink]

[^thatsWhatTheyWantYouToThink]: At least that's what they want you to think 👽

<!-- TODO alt text with figure -->

![](@images/duolingoDns.webp)

DNS is the phone book of the internet. Phone books map names to information about a person, like phone numbers and address. DNS maps domain names to information about IP addresses and redirects

## Why do we need Domain Names?

An IP address makes sense to a computer, but not to a human

> Go to 100.28.201.XXX for amazing deals on garlic bread and garlic bread accessories!

I don't know about you, but as much as I love garlic bread, I wouldn't remember where to go

> Go to garlicbread.com for amazing deals on garlic bread and garlic bread accessories!

Now we're talking. Pardon me while I empty out my bank account and give up my first born child

<!-- TODO add in amazing pic of garlic bread in footnote -->

### But I love memorizing long piles of numbers!

Don't get me wrong, if you want to memorize in a bunch of numbers whenever you need a new Garlic Glide Butter Blastinator 5000&trade;, be my guest

My brain only has so much room, and I will be filling it with cat pictures and speedrunning trivia, thank you very much

Not convinced? Unfortunately for you, dynamic IPs are here to soggy your garlic bread. Oftentimes, IPs are assigned from a pool—one day an IP points to one site and another the next. You'd have to ask Gary which IP address will take you to Gary's Garlic Bread Emporium, and Gary's pretty busy these days[^gary]

[^gary]: Gary if you're reading this, please answer my calls. It's been months and I'm starting to worry

<!-- TODO should this vhosts section be in here? It seems to mess with the flow -->

Even if you know the IP of a web server, it may use <abbr title="Virtual Hosts">vhosts</abbr> to allow the URI or Host header to direct what content you are served

Here's an example configuration from an Apache web server[^apache]

[^apache]: [Apache HTTP Server Version 2.4 Virtual Host Examples](https://httpd.apache.org/docs/2.4/vhosts/examples.html)

```apache
Listen 80
<VirtualHost *:80>
    ServerName www.garlic.com
    DocumentRoot "/www/garlic1"
    # Other directives here
</VirtualHost>
<VirtualHost *:80>
    ServerName www.garlic.org
    DocumentRoot "/www/garlic2"
    # Other directives here
</VirtualHost>
```

### Why don't ISPs just assign static IP addresses?

If you remember from [the previous article on IP addresses](https://playfulprogramming.com/posts/networking-101-udp-and-tcp#ipv4-vs-ipv6) from the networking series, We've long since run out of public IP addresses

## DNS to the rescue!

Luckily, DNS—or Domain Name System—is here to save the day! As the name implies, DNS is a way to find the IP of a domain name

Instead of customers asking Gary directly, Gary will keep their records up to date on their nameservers, and the DNS will handle the rest

## What is a name server?

<!-- TODO make garlic themed intro to DNS history -->

https://simson.net/ref/2001/WebHosting_HistoryOfDNS.htm

> Karp created a lookup table that mapped all of the network resources in one text-formatted file. Called `HOSTS.TXT`, the table contained all of the hostnames and their related IP addresses

## But I hate using web browsers!

<!-- Todo, something to flow between these -->

<!-- TODO does that make sense? maybe hating http is better? -->

Well that's odd, I wonder what contrived way you're reading this blog

Luckily for you, beyond browsing to garlic related web sites, you can also use <abbr title="File Transfer Protocol">FTP</abbr> to transfer garlic related files, <abbr title="Secure Shell">SSH</abbr> to login to your garlic bread inventory management server, or spread the good garlicy word in an email chain

<!-- TODO change to "totally garlic them" -->

> FW: You just got garliced!!
> ![A skeleton with cool glasses holding garlic bread. The caption reads "you just got garliced! share with 5 friends to get ungarliced](@images/garlicBread.webp)

## DNS allows for redirects

## Big nerd reading

https://web.archive.org/web/20120402205054/http://www.cbi.umn.edu/hostedpublications/pdf/McKenzieNCP1972.pdf
Dig into this more https://www.rfc-editor.org/rfc/rfc802#section-2.5
https://datatracker.ietf.org/doc/html/rfc952
List of host table examples https://gunkies.org/wiki/Host_table
ICANN is inherantly political https://www.youtube.com/watch?v=Rw96pH_Kdxo
Interview with first mass spam https://moosend.com/blog/gary-thuerk-people-make-the-same-mistakes-over-and-over-again/
