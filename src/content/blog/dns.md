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

If you've been doing your duolingo, you may say, "this is a blog focused on programming, what does <span lang="de">Desoxyribonukleinsäure</span> have to do with anything?"

I'm proud you know how to say DNA in German, but your 38 day Duolingo streak won't help here. I'm sorry to say that we are talking about the Domain Name System here, which is very much inorganic[^thatsWhatTheyWantYouToThink]

[^thatsWhatTheyWantYouToThink]: At least that's what they want you to think 👽

<!-- TODO alt text with figure -->

![](@images/duolingoDns.webp)

DNS is the phone book of the internet. Phone books map names to information about a person, like phone numbers and address. DNS maps domain names to information about IP addresses and redirects

## What's a domain?

An IP address makes sense to a computer, but not to a human. A domain simply identifies a location on the internet

> Go to 100.28.201.XXX for amazing deals on garlic bread and garlic bread accessories!

I don't know about you, but as much as I love garlic bread, I wouldn't remember where to go

> Go to garlicbread.com for amazing deals on garlic bread and garlic bread accessories!

Now we're talking. Pardon me while I empty out my bank account and give up my first born child

<!-- picture of sad spongebob after I give them up for bread -->

### But I love memorizing long piles of numbers!

Don't get me wrong, if you want to memorize in a bunch of numbers whenever you need a new Garlic Glide Butter Blastinator 5000&trade;, be my guest

My brain only has so much room, and I will be filling it with cat pictures and speedrunning trivia, thank you very much

<!-- TODO potentially link to farther along in the article to more sections instead of dumping it all here -->

Not convinced? Unfortunately for you, dynamic IPs are here to soggy your garlic bread. Oftentimes, IPs are assigned from a pool—one day an IP points to one site and another the next. You'd have to ask Gary which IP address will take you to Gary's Garlic Bread Emporium, and Gary's pretty busy these days[^gary]

[^gary]: Gary if you're reading this, please answer my calls. It's been months and I'm starting to worry

## HOSTS.TXT

Luckily for Gary (and garlic bread lovers alike), the GarlicBread administrators have created a file to map from domain to IP called `HOSTS.TXT`!

Gary just needs to let the admins know about any updates to their Garl-IP and Garlic Domains, and they'll be shared with anyone who needs to know. Gary finally can take their phone off <abbr title="Do not disturb">DND<abbr>

### Disaster strikes

Business is booming, and now there are over 1000 Garlic Domains registered in `HOSTS.TXT`

You are overjoyed to find out the Garlic Glide Butter Blastinator 5000&trade; is coming out in a few weeks

Sounds great right? Unfortunately not

Disaster strikes at the worst time—Giovanni from Garlic Bread Gazebo has hatched a dubiously devious plan. They register their own Garl-IP for garlicbread.com—twirling their mustache mustachiously—and their dastardly deed disrupts service before the launch of the Garlic Glide Butter Blastinator 5000&trade;! Anyone who had requested the latest `HOSTS.TXT` would be sent to the wrong address

<!-- TODO change to "totally garlic them" -->

> FW: You just got garliced!!
> ![A skeleton with cool glasses holding garlic bread. The caption reads "you just got garliced! share with 5 friends to get ungarliced](@images/garlicBread.webp)

## ARPAnet

GarlicNet was an allegory for ARPAnet and the Stanford Research Institute maintained the `HOSTS.TXT` file

The United States Department of Defense funded ARPA[^DARPA], or Advanced Research Projects Agency, to make a decentralized wide area network called ARPAnet

[^DARPA]: You may know ARPA today as <abbr title="Defense Advanced Research Projects Agency">DARPA</abbr>

Of course Giovanni's dastardly plot was just a hypothetical, but ARPAnet experienced many other issues relevant to GarlicNet

Modifying `HOSTS.TXT` was no small task, ARPAnet admins emailed their changes and retrieved the updated `HOSTS.TXT` through FTP

As more hosts joined ARPAnet, the central server sharing `HOSTS.TXT` became overloaded. Modifications due to new hosts or changed addresses became more frequent, meaning just like garlic bread left out overnight, copies of `HOSTS.TXT` were often stale

[^simson]: https://simson.net/ref/2001/WebHosting_HistoryOfDNS.htm

Less than 500 hosts existed in June 1982. Here's an excerpt from `HOSTS.TXT` [^hostsExcerpt82]

Note that this was before IP became the standard for ARPANET. This is using NCP[^NCP], which is the leftmost column here

```js
0/01    1 UCLA-ATS      |	ACC		    2/54    266 U UNIX  PDP11
1/01  101 UCLA-CCN      |	ACCAT-TIP	2/35    243 U TIP   H316  NELC-TIP
2/01  201 UCLA-SECURITY |	AEROSPACE	2/65 101002 S UNIX  VAX   A
```

[^NCP]: `0/01` refers to port 1 on IMP 0. https://datatracker.ietf.org/doc/html/rfc6529

[^hostsExcerpt82]: [hosts.txt/pub/hosts/19820615/SYSHST; HOSTS PRETTY at master · ttkzw/hosts.txt · GitHub](https://github.com/ttkzw/hosts.txt/blob/master/pub/hosts/19820615/SYSHST%3B%20HOSTS%20PRETTY)

Here's an excerpt from `HOSTS.TXT` from December 1989[^hostsExcerpt89]. There are now over 11000 hosts! This is using IP, which is the second field for reference

```js
NET : 4.0.0.0 : SATNET :
NET : 6.0.0.0 : YPG-NET :
NET : 7.0.0.0 : EDN-TEMP :
```

[^hostsExcerpt89]: [hosts.txt/pub/hosts/19891130/HOSTS.TXT at master · ttkzw/hosts.txt · GitHub](https://github.com/ttkzw/hosts.txt/blob/master/pub/hosts/19891130/HOSTS.TXT)

## A more scalable solution

Scaling issues were evident at even 400 hosts[^simson]!

## Other

## Dns is like an inverted tree

Why is this tree inverted? Because computer scientists never touched grass. Trees usually grow downwards up so this is a perfectly right side up tree in my opinion, but alas

### DNS allows for redirects

### Vhosts

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

## Big nerd reading

https://web.archive.org/web/20120402205054/http://www.cbi.umn.edu/hostedpublications/pdf/McKenzieNCP1972.pdf

Dig into this more https://www.rfc-editor.org/rfc/rfc802#section-2.5

https://datatracker.ietf.org/doc/html/rfc952

List of host table examples https://gunkies.org/wiki/Host_table

ICANN is inherantly political https://www.youtube.com/watch?v=Rw96pH_Kdxo

Interview with first mass spam https://moosend.com/blog/gary-thuerk-people-make-the-same-mistakes-over-and-over-again/

https://simson.net/ref/2001/WebHosting_HistoryOfDNS.htm
