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

If you're feeling a bit hungry after seeing this delicious 5 cheese garlic bread, I don't blame you. It's recommended to make some garlic bread before continuing

<!-- TODO add image of garlic bread here. Probably the pic I put in playful -->

## Agenda

<!-- TODO consider if this is necessary and clean up wording-->

First, we'll learn about what [DNS and domains](#what-is-dns) are, [initial solutions to mapping IPs to a domain, `HOSTS.TXT`](#hoststxt) and why this didn't scale well. If you aren't familiar with IP, consider checking out the [IP section of Networking 101: UDP & TCP](https://playfulprogramming.com/posts/networking-101-udp-and-tcp#ip-address) for a refresher. Afterwards, we'll learn about [`HOSTS.TXT`'s successor, the Domain Name System](#a-more-scalable-solution) itself. This includes going over Top level domains, name servers and resolution, and some common DNS records

## What is DNS?

If you've been doing your Duolingo, you may say, "this is a blog focused on programming, what does <span lang="de">Desoxyribonukleinsäure</span> have to do with anything?"

I'm proud you know how to say DNA in German, but your 38 day Duolingo streak won't help here. I'm sorry to say that we are talking about the Domain Name System here, which is very much inorganic[^thatsWhatTheyWantYouToThink]

[^thatsWhatTheyWantYouToThink]: At least that's what they want you to think 👽

<!-- TODO alt text with figure -->

![](@images/duolingoDns.webp)

DNS is the phone book of the internet. Phone books map names to information about a person, like phone numbers and address. DNS maps domain names to information about IP addresses and redirects

### What's a domain?

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

### ARPAnet

GarlicNet was an allegory for ARPAnet and the Stanford Research Institute maintained the `HOSTS.TXT` file

The United States Department of Defense funded ARPA[^DARPA], or Advanced Research Projects Agency, to make a decentralized wide area network called ARPAnet

[^DARPA]: You may know ARPA today as <abbr title="Defense Advanced Research Projects Agency">DARPA</abbr>

Of course Giovanni's dastardly plot was just a hypothetical, but ARPAnet experienced many other issues relevant to GarlicNet

- No mechanism to prevent name collisions
- Reliance on manual updates
- New hosts led to
  - a larger `HOSTS.TXT` file to distribute on relatively weak infrastructure
  - a higher fan out factor—each new host needs informed of each update
- Slow update times led to stale information

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

<blockquote cite="https://www.rfc-editor.org/rfc/rfc799">
 Even now, with over four hundred names and nicknames in the combined ARPANET-DCNET tables, this has become awkward
</blockquote>
— David Mills <cite><a href="https://www.rfc-editor.org/rfc/rfc799">RFC 799 - Internet Name Domains</a></cite>

Scaling issues were evident at even 400 hosts in 1981! David Mill's solution was intended to scale for thousands of hosts and it's still being used to this day!

There are far more than 1 billion IPV4 addresses with a domain name attached to them as of 2019[^amountOfHosts], according to the Internet Systems Consortium[^ISCReport]. Of course, this does not exactly describe the amount of hosts there are, but it's a good starting point to understand the sheer scale of DNS. _At least_ 1 billion IPs are attached to a domain name, as this doesn't account for IPV6 addresses

[^ISCReport]: https://ftp.isc.org/www/survey/reports/current/

<!-- TODO link to section where reverse lookups are described -->

[^amountOfHosts]:
    The Internet Domain Survey measures IP addresses attached to domains rather than the reverse. Originally, hosts were counted, but due to newfound zone transfer limitations, reverse mapping was used post 1981 [^ISCAbout]

    The survey was discontinued after 2019 since the results became misleading with the prevalence of IPV6 and private networks[^ISCSurveyEnds]

[^ISCAbout]: https://www.isc.org/survey-about/

[^ISCSurveyEnds]: https://www.isc.org/blogs/domain-survey-ends/

### Top Level Domains

<!-- TODO cite
The Berkeley Internet Name Domain Server https://www2.eecs.berkeley.edu/Pubs/TechRpts/1984/5957.html https://www2.eecs.berkeley.edu/Pubs/TechRpts/1984/CSD-84-182.pdf
-->

The key difference between `HOSTS.TXT` and DNS is distribution. Instead of one central source of truth, administration is delegated to sub-administrations. For example, `.com` domains are managed by Verasign[^verasignCom]

[^verasignCom]: https://itp.cdn.icann.org/en/files/registry-agreements/com/com-agreement-html-01-12-2024-en.htm

Domains are made of sections, known as labels, separated by dots

`com` is a <abbr>TLD</abbr> (Top Level Domain). Top Level Domains are the rightmost label of a domain name. For example, `legacy.jacobasper.com`[^legacy] has a TLD of `com`, a second level domain of `jacobasper`, and third level domain of `legacy`. If you so choose, you can add even more subdomains up to 253 characters[^maxLength]

![](/domain-segments.webp)

<!-- TODO get sign off on linking my own personal stuffs here -->

[^legacy]: Visit at your own risk https://legacy.jacobasper.com/

[^maxLength]:
    [RFC 1035 - DOMAIN NAMES - IMPLEMENTATION AND SPECIFICATION](https://datatracker.ietf.org/doc/html/rfc1035#section-2.3.4) says that a max length of the Fully Qualified Domain Name must be 255 characters or left, but this is accounting for the implied `.` at the end of a domain and the the length byte[^byteDisclaimer]. That's to say, `playfulprogramming.com` is shorthand for `playfulprogramming.com.`. There are 25 total characters, 18 for `playfulprogramming`, 2 for the `.` and length byte, and 3 for `com` and the implied `.` and terminating length byte

    There are more restrictions beyond just the length limit in the RFC if you're interested!

[^byteDisclaimer]: Whenever I mention byte, I mean 8 bits. For historical reasons[^historicalReasons], 8 bits is referred to as an octet, but I'm so used to just saying byte, so bear with me 😅

[^historicalReasons]: [WHY IS A BYTE 8 BITS? OR IS IT?](https://web.archive.org/web/20010627215719/http://www.bobbemer.com/BYTE.HTM)

### The DNS Tree

<!-- TODO talk about root zones and FQDN -->
<!-- RFC 1034 4.2 how zones are divided -->

Of course, `legacy.jacobasper.com` is just one choice of many. DNS looks more like a tree in reality. `com` has many second level domains, including `wikipedia` and `jacobasper`

<!-- TODO add stuffs on millions of com domains https://www.dnib.com/articles/the-domain-name-industry-brief-q1-2023 -->

![diagram showing a hierarchical treelike structure of the DNS. The parent node has several top level domains, which are further broken up into second and third level domains](@images/dns-tree.svg)

The root zone is represented by a dot. Domain names have an implicit 0 length label, so the Fully Qualified Domain Name <abbr>(FQDN)</abbr> for `garlic.bread` is `garlic.bread.`, though as you may have guessed, the terminating `.` is usually omitted for brevity

<!-- Info showing off domains we've seen and then describe how DNS servers are broken up -->

### Zones

So how does this help resolve the scaling issues from `HOSTS.TXT`?

Instead of a central source of truth, DNS is a distributed Database, with authority delegated into zones, which are simply a portion of the DNS tree

The manager of the `.bread` TLD is overburdened by managing `.garlic.bread` domains. There is simply too much garlic related lore for the bread administrators to handle. Avocado toast and sourdough is all good and well, but they don't know the first thing about the Garlic Councils restrictions on proper garlic press selection[^amateurs]. Luckily, the Garlic Council is glad to put any compliance issues on their plate so that the breadministration doesn't knead to!

[^amateurs]: Amateurs

![A DNS tree with circles surrounding each zone. A piece of the breadministration zone is delegated to the garlic council](@images/dns-zones.svg)

Authority over `garlic.bread` is now delegated to the Garlic Council. Their servers are now the place to go to get information about `garlic.bread` and its subdomains!

### Name Resolution

Let's look at a real example of zones in action! We'll find each of the zones traversed before reaching the authoritative zone for `legacy.jacobasper.com.`

We'll be running the following command

```bash
dig legacy.jacobasper.com. +trace +nodnssec | grep -Ev "unreachable|no servers"
```

Let's break it down

<!-- TODO breakdancing gif -->
<!-- TODO describe what a nameserver is before this -->

[`dig`](digManual) is a utility to DNS lookups. `+trace` will enable following the delegation path—it will start at the root name servers and follow their referrals until finding the authoritative name server. `+nodnssec` and piping to `grep` will filter information about DNSSEC and failed IPV6 lookups respectively

[digManual]: https://linux.die.net/man/1/dig

```
dig legacy.jacobasper.com. +trace +nodnssec | grep -Ev "unreachable|no servers"

; <<>> DiG 9.18.30-0ubuntu0.20.04.2-Ubuntu <<>> legacy.jacobasper.com. +trace
;; global options: +cmd

.			0	IN	NS	c.root-servers.net.
.			0	IN	NS	d.root-servers.net.
;;          omitted for brevity
.			0	IN	NS	a.root-servers.net.
.			0	IN	NS	b.root-servers.net.
;; Received 432 bytes from 192.168.144.1#53(192.168.144.1) in 0 ms
```

Note that `;` are used as comments, used here for some debug information and by myself to make the output easier to follow 😀. There is no difference in using one or more semicolons, but 2 are often used for readability

There are 13 root name servers[^why13RootServers], labeled `a` to `m`. Note that this does not mean there are 13 physical servers—13 IP addresses distribute load amongst more than 1500 servers[^1500Servers] across the globe

[^why13RootServers]: [Reason for Limited number of Root DNS Servers](https://lists.isc.org/pipermail/bind-users/2011-November/085653.html)

[^1500Servers]: As of June 10th, 2025, [there were "1954 instances operated by the 12 independent root server operators" according to root-servers.org](https://web.archive.org/web/20250610122946/https://root-servers.org/)

A name server answers queries about a particular domain name. The root servers are responsible for information in the root zone, in this case about where to find the Top Level Domain Name servers

#### So what are each of the columns in the `dig` output?

<!-- TODO these are DNS records right? -->
<!-- TODO link to where we talk about other common records -->
<!-- TODO link to more about caching, (TTL, secondary servers) -->

From left to right, we have the domain we're looking for, in this case the root domain. Then the <abbr>TTL</abbr>, or Time To Live, which specifies how long records can be cached for. More on caching later. The Class is `IN`, meaning Internet. There are other values, but today they are exceedingly rare, if used at all. The Type is the kind of record, in this case `NS` for Name Server. We'll go over more types of records later. Finally, we have the Fully Qualified Domain Name (FQDN) of the root name server

I'll include these column header comments for convenience from now on

```
;; domain       TTL Class Type  FQDN
   .        	0	IN	  NS	a.root-servers.net.
```

Root name server `a` very kindly refers us to the `com.` name servers, again ranging from `a` to `m`

Note the TTL for these records are 2 days

```
;; domain       TTL     Class Type  FQDN
   com.			172800	IN    NS  	l.gtld-servers.net.
   com.			172800	IN    NS  	j.gtld-servers.net.
;; omitted for brevity
   com.			172800	IN    NS  	c.gtld-servers.net.
   com.			172800	IN    NS  	e.gtld-servers.net.
;; Received 846 bytes from 198.41.0.4#53(a.root-servers.net) in 29 ms
```

The `com.` name servers refer us to the zone for `jacobasper.com.`, which are operated by DNSONE. I could use any DNS server to be authoritative for my domains, but I chose to use Netlify, which seems to use DNSONE!

```
;; domain               TTL     Class Type  FQDN
   jacobasper.com.		172800	IN	  NS	dns1.p08.nsone.net.
   jacobasper.com.		172800	IN    NS	dns2.p08.nsone.net.
   jacobasper.com.		172800	IN	  NS	dns3.p08.nsone.net.
   jacobasper.com.		172800	IN    NS	dns4.p08.nsone.net.
;; Received 139 bytes from 192.41.162.30#53(l.gtld-servers.net) in 29 ms
```

Finally, we reach the records we're after! `A` records stand for address, and describe the IPV4 address of a domain

```
;; domain                   TTL Class Type  FQDN
   legacy.jacobasper.com.	120	IN	  A 	34.234.106.80
   legacy.jacobasper.com.	120	IN	  A 	100.28.201.155
;; Received 82 bytes from 198.51.45.8#53(dns2.p08.nsone.net) in 29 ms
```

To sum it up, there was a DNS zone for the root zone, which referred us to the `.com` zone, which then referred us to the `jacobasper.com.` zone, which then knew where `legacy.jacobasper.com.` lives!

`legacy.jacobasper.com.` and `jacobasper.com` are both under this zone, as well as any arbitrary amount of subdomains I choose. I could also delegate further if I so chose, but I don't have too many domains to worry about, so the current setup is fine for me!

### Registering a domain

Speaking of, how did I manage to register `jacobasper.com.`?

How could I register a domain?

### Kinds of TLDs

<!-- TODO move this extra info after explaining more about zones and authorities and whatnot -->

Generic TLDs (<abbr>gTLD</abbr>) like `.com`, `.net`, and `.org`. These can be used by anyone

Sponsored TLDs (<abbr>sTLD</abbr>) like `.gov` and `.edu` have more stringent eligibility requirements, like being a US government or educational entity

Country Code TLDs (<abbr>ccTLD</abbr>) like `.us`, `.mx`, `.uk`, are managed by territories. Ironically, these do not necessarily need to be used for hosts within that country. Each country can decide registration rules.

On the looser side, `.tv` is used for Twitch and `.rs` is used for Rust related sites instead of Tuvaluan or Serbian related content. `.us` TLDs have far stricter rules, requiring the registrant to have ties to the US[^usTLDNexus]

[^usTLDNexus]: https://www.about.us/documents/policies/usTLD_Nexus_Requirements_Policy.pdf

## Other

## DNS is like an inverted tree

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

ICANN is inherently political https://www.youtube.com/watch?v=Rw96pH_Kdxo

Interview with first mass spam https://moosend.com/blog/gary-thuerk-people-make-the-same-mistakes-over-and-over-again/

https://simson.net/ref/2001/WebHosting_HistoryOfDNS.htm

The Berkeley Internet Name Domain Server https://www2.eecs.berkeley.edu/Pubs/TechRpts/1984/5957.html https://www2.eecs.berkeley.edu/Pubs/TechRpts/1984/CSD-84-182.pdf

DNS and Bind https://www.oreilly.com/library/view/dns-and-bind/0596100574/

TLD cloudflare https://www.cloudflare.com/learning/dns/top-level-domain/

Barry Brown DNS series (short and sweet overview) https://www.youtube.com/playlist?list=PL5DDE6309C9057EEA
