---
title: Ethereum Whitepaper
description: An introductory paper to Ethereum, published in 2013 before its launch.
---

_While several years old, we maintain the original paper below because it continues to serve as a useful reference and an accurate representation of Ethereum and its vision._

_尽管这篇论文已有数年历史，我们仍保留其原文，因为它依然是一个有价值的参考资料，并且准确体现了 Ethereum 及其愿景。_

> 本文<br />
> 这篇白皮书由 Vitalik Buterin 于 2013 年底撰写, 当时他年仅 19 岁.
> Ethereum 主网于 2015 年 7 月 30 日正式上线 (代号 Frontier).
> 白皮书中描述的许多设计在后续实现中有所调整, 但核心理念不变.
> 批注将标出这些历史与现实之间的差异.

# Ethereum Whitepaper

## A Next-Generation Smart Contract and Decentralized Application Platform

Satoshi Nakamoto’s development of Bitcoin in 2009 has often been hailed as a radical development in money and currency, being the first example of a digital asset which simultaneously has no backing or “[intrinsic value](https://bitcoinmagazine.com/culture/an-exploration-of-intrinsic-value-what-it-is-why-bitcoin-doesnt-have-it-and-why-bitcoin-does-have-it)” and no centralized issuer or controller.

Satoshi Nakamoto 在 2009 年对 Bitcoin 的开发，常被誉为货币与通货领域的一次激进突破，因为它第一次展示了一种既没有任何背书或“[intrinsic value](https://bitcoinmagazine.com/culture/an-exploration-of-intrinsic-value-what-it-is-why-bitcoin-doesnt-have-it-and-why-bitcoin-does-have-it)”，也没有中心化发行方或控制者的数字资产。

> **Satoshi Nakamoto**<br />
> Bitcoin 的匿名创造者, 其真实身份至今成谜.
> 2008 年发布 Bitcoin 白皮书, 2009 年上线主网, 2010 年后逐渐淡出, 此后再未公开露面.

> **intrinsic value (内在价值)**<br />
> 指资产本身固有的、不依赖于市场定价的价值.
> 黄金的 intrinsic value 来自其物理特性和工业用途.
> 批评者认为 Bitcoin 没有这种价值, 支持者则认为其稀缺性和网络效应本身就构成一种内在价值.

However, another, arguably more important, part of the Bitcoin experiment is the underlying blockchain technology as a tool of distributed consensus, and attention is rapidly starting to shift to this other aspect of Bitcoin.

然而，Bitcoin 实验中另一部分或许更为重要的内容，是其底层的 blockchain 技术作为一种分布式共识工具所展现出的能力；人们的关注也正迅速转向 Bitcoin 的这一面向。

> **blockchain 作为分布式共识工具**<br />
> 这句话在 2013 年写下时非常有前瞻性.
> 当时大多数人只把 Bitcoin 看作一种数字货币, 而 Vitalik 已经看到了 blockchain 技术在共识机制方面的更广泛潜力.

Commonly cited alternative applications of blockchain technology include using on-blockchain digital assets to represent custom currencies and financial instruments (“[colored coins](https://docs.google.com/a/buterin.com/document/d/1AnkP_cVZTCMLIzw4DvsW6M8Q2JC0lIzrTLuoWu2z1BE/edit)”), the ownership of an underlying physical device (“[smart property](https://en.bitcoin.it/wiki/Smart_Property)”), non-fungible assets such as domain names (“[Namecoin](http://namecoin.org)”), as well as more complex applications involving having digital assets being directly controlled by a piece of code implementing arbitrary rules (“[smart contracts](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/idea.html)”) or even blockchain-based “[decentralized autonomous organizations](http://bitcoinmagazine.com/7050/bootstrapping-a-decentralized-autonomous-corporation-part-i/)” (DAOs).

人们经常提到的 blockchain 技术替代应用，包括使用链上数字资产来表示自定义货币和金融工具（“[colored coins](https://docs.google.com/a/buterin.com/document/d/1AnkP_cVZTCMLIzw4DvsW6M8Q2JC0lIzrTLuoWu2z1BE/edit)”）、表示某个底层实体设备的所有权（“[smart property](https://en.bitcoin.it/wiki/Smart_Property)”）、表示诸如域名之类的非同质化资产（“[Namecoin](http://namecoin.org)”），以及更复杂的应用，例如让数字资产由一段实现任意规则的代码直接控制（“[smart contracts](http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/idea.html)”），甚至是基于 blockchain 的“[decentralized autonomous organizations](http://bitcoinmagazine.com/7050/bootstrapping-a-decentralized-autonomous-corporation-part-i/)”（DAOs）。

> **smart contracts (智能合约)**<br />
> 这一概念由密码学家 Nick Szabo 在 1990 年代中期提出, 远早于 Bitcoin 的诞生.
> 指的是一段能够自动执行、不可篡改的代码, 按照预设条件管理数字资产的转移.
> 可以类比为一台自动售货机: 投币 + 选择 → 自动出货, 无需人工干预.

> **DAOs (去中心化自治组织)**<br />
> 一种完全由代码规则和成员投票驱动的组织形式, 没有传统的管理层级.
> 在后来的实践中, DAOs 成为了 DeFi 和 Web3 治理的核心模式之一.

What Ethereum intends to provide is a blockchain with a built-in fully fledged Turing-complete programming language that can be used to create “contracts” that can be used to encode arbitrary state transition functions, allowing users to create any of the systems described above, as well as many others that we have not yet imagined, simply by writing up the logic in a few lines of code.

Ethereum 想要提供的是一条内建完整 Turing-complete 编程语言的 blockchain，这种语言可用于创建“contracts”，从而编码任意状态转移函数，使用户只需写出几行逻辑代码，就能构建上述任何一种系统，以及许多我们尚未设想出来的其他系统。

> **Turing-complete (图灵完备)**<br />
> 指一个计算系统能够模拟任意图灵机, i.e., 理论上可以执行任何可计算的程序.
> Bitcoin 的 Script 语言特意不支持循环, 因此不是 Turing-complete 的.
> Ethereum 选择 Turing-completeness 是一个关键的设计决策, 代价是必须引入 gas 机制来防止无限循环.

> **核心命题**<br />
> 这段话是整篇白皮书的核心论点: 与其为每种应用各造一条专用链, 不如造一条通用可编程的链.
> 这正是 Ethereum 被称为“世界计算机”的原因.

## Introduction to Bitcoin and Existing Concepts

### History

The concept of decentralized digital currency, as well as alternative applications like property registries, has been around for decades.

去中心化数字货币这一概念，以及诸如产权登记等替代性应用，已经存在了数十年。

> **History 章节导语**<br />
> 本章梳理了从 1980 年代到 2009 年 Bitcoin 诞生之间的去中心化货币发展史.
> 每一次尝试都解决了一部分问题, 但也留下了新的挑战; Bitcoin 则集大成地完成了最后一块拼图.

The anonymous e-cash protocols of the 1980s and the 1990s, mostly reliant on a cryptographic primitive known as Chaumian blinding, provided a currency with a high degree of privacy, but the protocols largely failed to gain traction because of their reliance on a centralized intermediary.

20 世纪 80 年代和 90 年代的匿名电子现金协议，主要依赖一种称为 Chaumian blinding 的密码学原语，提供了高度隐私性的货币形式；但由于这些协议依赖中心化中介，因此总体上未能获得广泛采用。

> **Chaumian blinding (Chaum 盲签名)**<br />
> 由密码学家 David Chaum 于 1983 年提出.
> 核心思想: 银行对交易签名时看不到交易内容, 从而保护用户隐私.
> 类比: 你把一张支票放在碳纸信封里让银行盖章, 银行签了字但没看到支票内容.
> 致命弱点: 仍然需要一个中心化的银行来签名.

In 1998, Wei Dai’s [b-money](http://www.weidai.com/bmoney.txt) became the first proposal to introduce the idea of creating money through solving computational puzzles as well as decentralized consensus, but the proposal was scant on details as to how decentralized consensus could actually be implemented.

1998 年，Wei Dai 的 [b-money](http://www.weidai.com/bmoney.txt) 首次提出通过求解计算谜题以及去中心化共识来创造货币的思想，但该提案对于去中心化共识究竟如何落地实现，细节仍然相当匮乏。

In 2005, Hal Finney introduced a concept of “[reusable proofs of work](https://nakamotoinstitute.org/finney/rpow/)”, a system which uses ideas from b-money together with Adam Back’s computationally difficult Hashcash puzzles to create a concept for a cryptocurrency, but once again fell short of the ideal by relying on trusted computing as a backend.

2005 年，Hal Finney 提出了“[reusable proofs of work](https://nakamotoinstitute.org/finney/rpow/)”这一概念。该系统结合了 b-money 的思想以及 Adam Back 提出的计算上较难的 Hashcash 谜题，形成了一种 cryptocurrency 的构想；但它再次因为依赖可信计算作为后端，而未能达到理想中的去中心化目标。

In 2009, a decentralized currency was for the first time implemented in practice by Satoshi Nakamoto, combining established primitives for managing ownership through public key cryptography with a consensus algorithm for keeping track of who owns coins, known as “proof-of-work”.

2009 年，Satoshi Nakamoto 首次在实践中实现了一种去中心化货币，将通过公钥密码学管理所有权的成熟原语，与一种用于追踪 coin 归属的共识算法结合起来，这种算法被称为 “proof-of-work”。

> **Bitcoin 的两大创新**<br />
> Satoshi 并没有发明全新的密码学, 他的天才在于组合:
> (1) 公钥密码学 → 证明“谁拥有这笔钱”;
> (2) proof-of-work + 最长链规则 → 证明“交易顺序是什么”.
> 前者早已成熟, 后者才是 Bitcoin 的真正突破.

The mechanism behind proof-of-work was a breakthrough in the space because it simultaneously solved two problems.

proof-of-work 背后的机制之所以是这一领域的突破，在于它同时解决了两个问题。

First, it provided a simple and moderately effective consensus algorithm, allowing nodes in the network to collectively agree on a set of canonical updates to the state of the Bitcoin ledger.

第一，它提供了一种简单且相当有效的共识算法，使网络中的节点能够就 Bitcoin 账本状态的一组规范更新达成集体一致。

Second, it provided a mechanism for allowing free entry into the consensus process, solving the political problem of deciding who gets to influence the consensus, while simultaneously preventing sybil attacks.

第二，它提供了一种允许自由进入共识过程的机制，解决了“由谁来影响共识”这一政治问题，同时还能防止 sybil attacks。

> **sybil attack (女巫攻击)**<br />
> 指攻击者创建大量伪造身份来操纵投票或共识.
> 名称源自一本关于多重人格障碍的书.
> 在传统的“一人一票”系统中, 只要能免费创建新身份就能作弊.
> proof-of-work 通过要求实际付出计算成本来抵御这种攻击: 创建再多身份也没用, 因为总算力不变.

It does this by substituting a formal barrier to participation, such as the requirement to be registered as a unique entity on a particular list, with an economic barrier - the weight of a single node in the consensus voting process is directly proportional to the computing power that the node brings.

它做到这一点的方式，是用经济门槛替代形式化的参与门槛，例如要求某个实体必须先在特定名单中注册为唯一身份；在这里，单个节点在共识投票过程中的权重，直接与其提供的计算能力成正比。

Since then, an alternative approach has been proposed called _proof-of-stake_, calculating the weight of a node as being proportional to its currency holdings and not computational resources; the discussion of the relative merits of the two approaches is beyond the scope of this paper but it should be noted that both approaches can be used to serve as the backbone of a cryptocurrency.

此后，人们又提出了一种称为 _proof-of-stake_ 的替代方案，它将节点权重设定为与其持有的货币数量成正比，而非与计算资源成正比；两种方案的相对优劣不在本文讨论范围之内，但需要指出的是，这两种方法都可以作为 cryptocurrency 的基础骨架。

> **proof-of-stake (权益证明)**<br />
> PoW: 谁算力多, 谁说了算 → 耗电巨大.
> PoS: 谁 stake (质押) 的币多, 谁说了算 → 节能.
> 作弊者的 stake 会被 “slash” (罚没), 这就是经济惩罚机制.

> **历史与当前差异**<br />
> 白皮书写作时 (2013), Ethereum 计划使用 PoW.
> Ethereum 最终于 2022 年 9 月 15 日完成了 “The Merge”, 从 PoW 切换到 PoS.
> 这一转型使 Ethereum 的能源消耗降低了约 99.95%.

### Bitcoin As A State Transition System

![Ethereum state transition](https://ethereum.org/content/whitepaper/ethereum-state-transition.png)

From a technical standpoint, the ledger of a cryptocurrency such as Bitcoin can be thought of as a state transition system, where there is a “state” consisting of the ownership status of all existing bitcoins and a “state transition function” that takes a state and a transaction and outputs a new state which is the result.

从技术角度来看，Bitcoin 这样的 cryptocurrency 账本可以被视为一个状态转移系统，其中存在一个“state”，它由所有现存 bitcoin 的所有权状态组成；同时还存在一个“state transition function”，它接收某个 state 和一笔 transaction，并输出作为结果的新 state。

> **状态转移系统 (state transition system)**<br />
> 这是理解整篇白皮书最关键的抽象.
> 把 blockchain 看作 `状态 + 交易 → 新状态` 的函数式模型, 而不是“一堆交易记录”.
> 这一抽象使得 Ethereum 的通用计算成为可能: 只要重新定义 state 和 transition function, 就能实现任意应用.

In a standard banking system, for example, the state is a balance sheet, a transaction is a request to move $X from A to B, and the state transition function reduces the value in A’s account by $X and increases the value in B’s account by $X.

例如，在标准银行系统中，state 是一张资产负债表，transaction 是一项将 $X 从 A 转移到 B 的请求，而 state transition function 会把 A 账户中的金额减少 $X，并把 B 账户中的金额增加 $X。

If A’s account has less than $X in the first place, the state transition function returns an error.

如果 A 的账户原本少于 $X，那么 state transition function 就会返回错误。

Hence, one can formally define:

因此，可以形式化地定义为：

```
APPLY(S, TX) -> S' or ERROR
```

In the banking system defined above:

在上述定义的银行系统中：

```js
APPLY({ Alice: $50, Bob: $50 }, "send $20 from Alice to Bob") = { Alice: $30, Bob: $70 }
```

But:

但是：

```js
APPLY({ Alice: $50, Bob: $50 }, "send $70 from Alice to Bob") = ERROR
```

The “state” in Bitcoin is the collection of all coins (technically, “unspent transaction outputs” or UTXO) that have been minted and not yet spent, with each UTXO having a denomination and an owner (defined by a 20-byte address which is essentially a cryptographic public key[^1]).

Bitcoin 中的“state”是所有已被铸造但尚未花费的 coin 的集合（技术上称为 “unspent transaction outputs” 或 UTXO）；每个 UTXO 都具有面额和所有者（由一个 20-byte 地址定义，本质上相当于一个密码学公钥[^1]）。

> **UTXO (未花费交易输出)**<br />
> Bitcoin 不像银行那样给每个账户维护“余额”; 相反, 它追踪的是一堆散落的“找零”.
> 你的“余额”实际上是所有属于你的 UTXO 面额之和.
> 举例: 你有 3 个 UTXO, 分别值 0.5, 1.2, 0.3 BTC, 那么你的“余额”就是 2.0 BTC.
> 每次花钱都必须整体消耗某些 UTXO 并创建新的 UTXO (包括找零).

A transaction contains one or more inputs, with each input containing a reference to an existing UTXO and a cryptographic signature produced by the private key associated with the owner’s address, and one or more outputs, with each output containing a new UTXO to be added to the state.

一笔 transaction 包含一个或多个 input，每个 input 都包含对某个现有 UTXO 的引用，以及由该 UTXO 所有者地址对应私钥生成的密码学签名；它还包含一个或多个 output，每个 output 都包含一个将被加入 state 的新 UTXO。

The state transition function `APPLY(S, TX) -> S'` can be defined roughly as follows:

状态转移函数 `APPLY(S, TX) -> S'` 可以大致定义如下：

- For each input in `TX`:
  对 `TX` 中的每个 input：
  - If the referenced UTXO is not in `S`, return an error.
    如果被引用的 UTXO 不在 `S` 中，返回错误。
  - If the provided signature does not match the owner of the UTXO, return an error.
    如果提供的签名与该 UTXO 的所有者不匹配，返回错误。
- If the sum of the denominations of all input UTXO is less than the sum of the denominations of all output UTXO, return an error.
  如果所有 input UTXO 的面额总和小于所有 output UTXO 的面额总和，返回错误。
- Return `S` with all input UTXO removed and all output UTXO added.
  返回更新后的 `S`：移除所有 input UTXO，并加入所有 output UTXO。

The first half of the first step prevents transaction senders from spending coins that do not exist, the second half of the first step prevents transaction senders from spending other people’s coins, and the second step enforces conservation of value.

第一步的前半部分防止 transaction 发送者花费并不存在的 coin，第一步的后半部分防止 transaction 发送者花费他人的 coin，而第二步则强制维持价值守恒。

> **价值守恒与 transaction fee**<br />
> 注意条件是 “inputs 总额 < outputs 总额 则报错”, 而不是 “不相等则报错”.
> 这意味着 inputs 总额可以 *大于* outputs 总额, 差额就是矿工的 transaction fee.
> 这是 Bitcoin fee 机制的精妙之处: fee 不需要显式声明, 而是隐含在差额中.

In order to use this for payment, the protocol is as follows.

如果要将这一机制用于支付，其协议如下。

Suppose Alice wants to send 11.7 BTC to Bob.

假设 Alice 想向 Bob 发送 11.7 BTC。

First, Alice will look for a set of available UTXO that she owns that totals up to at least 11.7 BTC.

首先，Alice 会寻找一组自己拥有且总额至少为 11.7 BTC 的可用 UTXO。

Realistically, Alice will not be able to get exactly 11.7 BTC; say that the smallest she can get is 6+4+2=12.

在现实中，Alice 往往无法刚好凑出 11.7 BTC；假设她能找到的最小组合是 6+4+2=12。

She then creates a transaction with those three inputs and two outputs.

然后，她会用这三个 input 和两个 output 创建一笔 transaction。

The first output will be 11.7 BTC with Bob’s address as its owner, and the second output will be the remaining 0.3 BTC “change”, with the owner being Alice herself.

第一个 output 是 11.7 BTC，所有者设为 Bob 的地址；第二个 output 则是剩余的 0.3 BTC“找零”，所有者是 Alice 自己。

### Mining

![Ethereum blocks](https://ethereum.org/content/whitepaper/ethereum-blocks.png)

If we had access to a trustworthy centralized service, this system would be trivial to implement; it could simply be coded exactly as described, using a centralized server’s hard drive to keep track of the state.

如果我们能够使用一个可信的中心化服务，这个系统会非常容易实现；只需完全按上述描述编码，并用中心化服务器的硬盘来记录 state 即可。

However, with Bitcoin we are trying to build a decentralized currency system, so we will need to combine the state transaction system with a consensus system in order to ensure that everyone agrees on the order of transactions.

但在 Bitcoin 中，我们试图构建的是一个去中心化货币系统，因此必须将状态交易系统与共识系统结合起来，以确保所有人都能就 transaction 的顺序达成一致。

Bitcoin’s decentralized consensus process requires nodes in the network to continuously attempt to produce packages of transactions called “blocks”.

Bitcoin 的去中心化共识过程要求网络中的节点不断尝试生成称为 “blocks” 的交易打包结果。

The network is intended to produce roughly one block every ten minutes, with each block containing a timestamp, a nonce, a reference to (i.e., hash of) the previous block and a list of all of the transactions that have taken place since the previous block.

该网络的设计目标是大约每十分钟产生一个 block，每个 block 都包含时间戳、nonce、对前一个 block 的引用（即其 hash），以及自前一个 block 以来发生的所有 transaction 列表。

> **nonce**<br />
> “number used once” 的缩写.
> miners 不断修改 nonce 的值来尝试不同的 block hash, 直到找到满足难度目标的值.
> 这就是 mining 的本质: 一场大规模的暴力试错.

Over time, this creates a persistent, ever-growing, “blockchain” that constantly updates to represent the latest state of the Bitcoin ledger.

随着时间推移，这会形成一条持续存在且不断增长的 “blockchain”，它持续更新，以表示 Bitcoin 账本的最新状态。

The algorithm for checking if a block is valid, expressed in this paradigm, is as follows:

在这一范式下，检验一个 block 是否有效的算法如下：

1. Check if the previous block referenced by the block exists and is valid.
   检查该 block 所引用的前一个 block 是否存在且有效。
2. Check that the timestamp of the block is greater than that of the previous block[^2] and less than 2 hours into the future
   检查该 block 的时间戳是否大于前一个 block 的时间戳[^2]，并且不超过未来 2 小时。
3. Check that the proof-of-work on the block is valid.
   检查该 block 上的 proof-of-work 是否有效。
4. Let `S[0]` be the state at the end of the previous block.
   令 `S[0]` 为前一个 block 结束时的 state。
5. Suppose `TX` is the block’s transaction list with `n` transactions.  For all `i` in `0...n-1`, set `S[i+1] = APPLY(S[i], TX[i])` If any application returns an error, exit and return false.
   假设 `TX` 是该 block 含有 `n` 笔 transaction 的交易列表。对于 `0...n-1` 中的所有 `i`，令 `S[i+1] = APPLY(S[i], TX[i])`。如果任何一次应用返回错误，则退出并返回 false。
6. Return true, and register `S[n]` as the state at the end of this block.
   返回 true，并将 `S[n]` 记录为该 block 结束时的 state。

Essentially, each transaction in the block must provide a valid state transition from what was the canonical state before the transaction was executed to some new state.

本质上，block 中的每一笔 transaction 都必须提供一次有效的状态转移，即从该 transaction 执行前的规范 state 转换到某个新 state。

Note that the state is not encoded in the block in any way; it is purely an abstraction to be remembered by the validating node and can only be (securely) computed for any block by starting from the genesis state and sequentially applying every transaction in every block.

需要注意的是，state 并不会以任何形式被编码进 block；它纯粹是由验证节点记住的一种抽象，并且只有从 genesis state 开始，按顺序对每个 block 中的每一笔 transaction 逐一应用，才能为任意 block 安全地计算出对应的 state。

> **state 不存储在 block 中**<br />
> 更准确地说, Bitcoin 和 Ethereum 的 block 都不直接存完整 state.
> Bitcoin 的 block 只存 transaction 列表; 要恢复某一时刻的 UTXO 集, 需要按顺序处理历史交易.
> Ethereum 的 block header 额外承诺了 state root (状态树的根 hash), 便于校验「计算出来的 state 是否正确」.
> 但这并不意味着 full node 可以完全跳过历史执行; 只是同步和校验方式比白皮书当年设想得更灵活.

Additionally, note that the order in which the miner includes transactions into the block matters; if there are two transactions A and B in a block such that B spends a UTXO created by A, then the block will be valid if A comes before B but not otherwise.

此外，miner 将 transaction 纳入 block 的顺序也很重要；如果一个 block 中有两笔 transaction A 和 B，且 B 花费了 A 创建的 UTXO，那么只有在 A 先于 B 出现时，该 block 才是有效的，否则无效。

The one validity condition present in the above list that is not found in other systems is the requirement for “proof-of-work”.

上述有效性条件列表中，有一项是其他系统里没有的，那就是对 “proof-of-work” 的要求。

The precise condition is that the double-SHA256 hash of every block, treated as a 256-bit number, must be less than a dynamically adjusted target, which as of the time of this writing is approximately 2<sup>187</sup>.

其精确条件是：将每个 block 的 double-SHA256 hash 视为一个 256-bit 数，该数必须小于一个动态调整的目标值；在本文写作时，这个目标值大约是 2<sup>187</sup>。

The purpose of this is to make block creation computationally “hard”, thereby preventing sybil attackers from remaking the entire blockchain in their favor.

这样做的目的是让 block 的创建在计算上足够“困难”，从而阻止 sybil 攻击者为了自身利益重造整条 blockchain。

Because SHA256 is designed to be a completely unpredictable pseudo-random function, the only way to create a valid block is simply trial and error, repeatedly incrementing the nonce and seeing if the new hash matches.

由于 SHA256 被设计为完全不可预测的伪随机函数，因此创建一个有效 block 的唯一办法就是不断试错，反复增加 nonce，并查看新的 hash 是否满足条件。

At the current target of ~2<sup>187</sup>, the network must make an average of ~2<sup>69</sup> tries before a valid block is found; in general, the target is recalibrated by the network every 2016 blocks so that on average a new block is produced by some node in the network every ten minutes.

在当前约为 2<sup>187</sup> 的目标下，网络平均需要尝试约 2<sup>69</sup> 次才能找到一个有效 block；一般来说，网络会每 2016 个 block 重新校准一次目标，以保证平均每十分钟由网络中的某个节点产生一个新 block。

> **difficulty adjustment (难度调整)**<br />
> 2016 个 blocks × 10 分钟 = 约 2 周.
> 如果过去 2 周出块过快, 说明全网算力增加了, 难度就调高; 反之调低.
> 这种自适应机制会把长期平均出块间隔拉回到约 10 分钟, 但短期仍会因 retarget 滞后而波动.

In order to compensate miners for this computational work, the miner of every block is entitled to include a transaction giving themselves 25 BTC out of nowhere.

为了补偿 miners 所付出的计算工作，每个 block 的 miner 都有权在其中加入一笔 transaction，凭空给自己分配 25 BTC。

> **block reward (区块奖励)**<br />
> 这里提到的 25 BTC 是 2013 年白皮书写作时的数字.
> Bitcoin 的 block reward 每 210,000 个 blocks (约 4 年) 减半一次:
> 50 BTC (2009) → 25 (2012) → 12.5 (2016) → 6.25 (2020) → 3.125 (2024).
> 总量约 2100 万枚, 预计在 2140 年左右全部发行完毕.

Additionally, if any transaction has a higher total denomination in its inputs than in its outputs, the difference also goes to the miner as a “transaction fee”.

此外，如果某笔 transaction 的 inputs 总面额高于其 outputs 总面额，这一差额也会作为 “transaction fee” 归 miner 所有。

Incidentally, this is also the only mechanism by which BTC are issued; the genesis state contained no coins at all.

顺便一提，这也是 BTC 唯一的发行机制；genesis state 中原本完全没有任何 coin。

> **genesis block (创世块)**<br />
> Bitcoin 的创世块于 2009 年 1 月 3 日由 Satoshi Nakamoto 挖出.
> 其 coinbase 交易中嵌入了一句著名的话: “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”.
> 这是当天《泰晤士报》的头条, 暗示了 Bitcoin 诞生的动机: 对传统金融体系的不信任.

In order to better understand the purpose of mining, let us examine what happens in the event of a malicious attacker.

为了更好地理解 mining 的作用，我们来看一下恶意攻击者出现时会发生什么。

Since Bitcoin’s underlying cryptography is known to be secure, the attacker will target the one part of the Bitcoin system that is not protected by cryptography directly: the order of transactions.

由于 Bitcoin 的底层密码学被认为是安全的，攻击者会针对 Bitcoin 系统中那个并未被密码学直接保护的部分发动攻击：transaction 的顺序。

The attacker’s strategy is simple:

攻击者的策略很简单：

1. Send 100 BTC to a merchant in exchange for some product (preferably a rapid-delivery digital good)
   向商家发送 100 BTC 以换取某种商品（最好是可快速交付的数字商品）。
2. Wait for the delivery of the product
   等待商品交付。
3. Produce another transaction sending the same 100 BTC to himself
   再构造一笔 transaction，把同样的 100 BTC 发送给自己。
4. Try to convince the network that his transaction to himself was the one that came first.
   试图让网络相信，自己给自己的那笔 transaction 才是先发生的。

Once step (1) has taken place, after a few minutes some miner will include the transaction in a block, say block number 270000.

当步骤 (1) 发生之后，几分钟内就会有某个 miner 将这笔 transaction 放入某个 block，比如编号为 270000 的 block。

After about one hour, five more blocks will have been added to the chain after that block, with each of those blocks indirectly pointing to the transaction and thus “confirming” it.

大约一小时后，该 block 之后的链上又会增加五个 block，而这些 block 都会间接指向那笔 transaction，从而对其进行“确认”。

At this point, the merchant will accept the payment as finalized and deliver the product; since we are assuming this is a digital good, delivery is instant.

此时，商家会认为付款已最终完成，并交付商品；由于我们假设这是一种数字商品，因此交付是即时的。

Now, the attacker creates another transaction sending the 100 BTC to himself.

这时，攻击者再创建另一笔把 100 BTC 发给自己的 transaction。

If the attacker simply releases it into the wild, the transaction will not be processed; miners will attempt to run `APPLY(S, TX)` and notice that `TX` consumes a UTXO which is no longer in the state.

如果攻击者只是把它直接广播出去，这笔 transaction 不会被处理；miners 会尝试执行 `APPLY(S, TX)`，并发现 `TX` 消耗了一个已经不在当前 state 中的 UTXO。

So instead, the attacker creates a “fork” of the blockchain, starting by mining another version of block 270000 pointing to the same block 269999 as a parent but with the new transaction in place of the old one.

因此，攻击者会改为创建一条 blockchain 的“fork”：先挖出另一个版本的 270000 号 block，它同样指向 269999 号 block 作为父块，但用新的 transaction 替换掉旧的 transaction。

Because the block data is different, this requires redoing the proof-of-work.

由于 block 数据发生了变化，这就需要重新执行 proof-of-work。

Furthermore, the attacker’s new version of block 270000 has a different hash, so the original blocks 270001 to 270005 do not “point” to it; thus, the original chain and the attacker’s new chain are completely separate.

此外，攻击者的新版本 270000 号 block 具有不同的 hash，因此原来的 270001 到 270005 号 block 都不会“指向”它；于是，原链与攻击者的新链就完全分离了。

The rule is that in a fork the longest blockchain is taken to be the truth, and so legitimate miners will work on the 270005 chain while the attacker alone is working on the 270000 chain.

规则是，在 fork 出现时，最长的 blockchain 会被视为真实链，因此合法 miners 会继续在 270005 这条链上工作，而攻击者则独自在 270000 那条链上挖矿。

In order for the attacker to make his blockchain the longest, he would need to have more computational power than the rest of the network combined in order to catch up (hence, “51% attack”).

若攻击者想让自己的 blockchain 成为最长链，他就必须拥有超过网络其余所有参与者总和的计算能力，才能追赶上来（这也就是所谓的 “51% attack”）。

> **51% attack (51% 攻击)**<br />
> 准确地说, 攻击者不需要恰好 51%, 只要超过其余所有人的总和即可.
> 但即便掌握了多数算力, 攻击者主要能做的仍是重组近期区块、双花自己的币, 或阻止某些交易被确认.
> 攻击者 *无法* 凭空创造新币, 也 *无法* 窃取他人的币, 因为这需要伪造数字签名.

> **确认数 (confirmations)**<br />
> 上面的例子中, 商家等了 6 个 block (约 1 小时) 才确认交易.
> 每多一个 block 的确认, 被逆转的难度就指数级增长.
> 实践中, 小额交易通常等 1-2 个确认即可, 大额交易建议等 6 个以上.

### Merkle Trees

![SPV in Bitcoin](https://ethereum.org/content/whitepaper/spv-bitcoin.png)

_Left: it suffices to present only a small number of nodes in a Merkle tree to give a proof of the validity of a branch._

_左：只需给出 Merkle tree 中少量节点，就足以证明某个分支的有效性。_

_Right: any attempt to change any part of the Merkle tree will eventually lead to an inconsistency somewhere up the chain._

_右：任何试图修改 Merkle tree 任意部分的行为，最终都会在向上的某一层链路中暴露出不一致。_

An important scalability feature of Bitcoin is that the block is stored in a multi-level data structure.

Bitcoin 的一个重要可扩展性特征，是 block 以多层数据结构的形式存储。

The “hash” of a block is actually only the hash of the block header, a roughly 200-byte piece of data that contains the timestamp, nonce, previous block hash and the root hash of a data structure called the Merkle tree storing all transactions in the block.

一个 block 的“hash”实际上只是其 block header 的 hash。这个大约 200-byte 的数据片段包含时间戳、nonce、前一个 block 的 hash，以及一个名为 Merkle tree 的数据结构的根 hash，而该数据结构存储了 block 中的全部 transaction。

A Merkle tree is a type of binary tree, composed of a set of nodes with a large number of leaf nodes at the bottom of the tree containing the underlying data, a set of intermediate nodes where each node is the hash of its two children, and finally a single root node, also formed from the hash of its two children, representing the “top” of the tree.

Merkle tree 是一种二叉树，由一组节点构成：树的底部有大量叶子节点保存底层数据，中间有一组中间节点，每个节点都是其两个子节点的 hash，最后是单个根节点，它同样由其两个子节点的 hash 构成，代表整棵树的“顶部”。

> **Merkle tree 举例**<br />
> 假设 block 中有 4 笔交易 T1, T2, T3, T4:
> 叶子节点: H1=hash(T1), H2=hash(T2), H3=hash(T3), H4=hash(T4)
> 中间节点: H12=hash(H1+H2), H34=hash(H3+H4)
> 根节点: Root=hash(H12+H34)
> 要证明 T3 在 block 中, 只需提供 H4 和 H12 (共 2 个 hash), 而不必传输全部 4 笔交易.
> 对于包含 N 笔交易的 block, 证明大小仅为 O(log N).

The purpose of the Merkle tree is to allow the data in a block to be delivered piecemeal: a node can download only the header of a block from one source, the small part of the tree relevant to them from another source, and still be assured that all of the data is correct.

Merkle tree 的目的，是允许 block 中的数据被分片交付：一个节点可以从某个来源只下载 block 的 header，再从另一个来源下载与自己相关的那一小部分树结构，同时依然能够确认所有数据都是正确的。

The reason why this works is that hashes propagate upward: if a malicious user attempts to swap in a fake transaction into the bottom of a Merkle tree, this change will cause a change in the node above, and then a change in the node above that, finally changing the root of the tree and therefore the hash of the block, causing the protocol to register it as a completely different block (almost certainly with an invalid proof-of-work).

之所以能够这样做，是因为 hash 会向上传播：如果恶意用户试图在 Merkle tree 底部替换进一笔伪造 transaction，那么这个变化会导致其上层节点发生变化，再进一步导致更上层节点变化，最终改变整棵树的根，也就改变了 block 的 hash，从而使协议将其识别为一个完全不同的 block（而且几乎肯定带有无效的 proof-of-work）。

The Merkle tree protocol is arguably essential to long-term sustainability.

可以说，Merkle tree 协议对于长期可持续性至关重要。

A “full node” in the Bitcoin network, one that stores and processes the entirety of every block, takes up about 15 GB of disk space in the Bitcoin network as of April 2014, and is growing by over a gigabyte per month.

在 Bitcoin 网络中，一个“full node”需要存储并处理每一个 block 的全部内容；截至 2014 年 4 月，这大约需要 15 GB 的磁盘空间，并且每个月还会增长超过 1 GB。

Currently, this is viable for some desktop computers and not phones, and later on in the future only businesses and hobbyists will be able to participate.

目前，这对一部分桌面电脑来说仍然可行，但对手机并不可行；再往后，恐怕只有企业和爱好者才能继续参与。

A protocol known as “simplified payment verification” (SPV) allows for another class of nodes to exist, called “light nodes”, which download the block headers, verify the proof-of-work on the block headers, and then download only the “branches” associated with transactions that are relevant to them.

一种称为 “simplified payment verification”（SPV）的协议，使另一类节点成为可能，即“light nodes”。它们只下载 block headers，验证这些 block headers 上的 proof-of-work，然后只下载与自己相关 transaction 对应的那些“branches”。

This allows light nodes to determine with a strong guarantee of security what the status of any Bitcoin transaction, and their current balance, is while downloading only a very small portion of the entire blockchain.

这样一来，light nodes 只需下载整条 blockchain 中极小的一部分数据，就能在强安全保证下判断任意 Bitcoin transaction 的状态以及自己的当前余额。

> **SPV (简化支付验证)**<br />
> SPV 让手机等资源受限的设备, 可以在不运行 full node 的前提下验证常见支付场景.
> light node 只需存储 block headers (每个约 80 bytes) 而非完整 blocks.
> 截至 2024 年, 所有 block headers 总共仅约 60 MB, 而完整 blockchain 已超过 500 GB.

### Alternative Blockchain Applications

The idea of taking the underlying blockchain idea and applying it to other concepts also has a long history.

将底层 blockchain 思想应用到其他概念上的做法，同样有着悠久的历史。

In 2005, Nick Szabo came out with the concept of “[secure property titles with owner authority](https://nakamotoinstitute.org/library/secure-property-titles/)”, a document describing how “new advances in replicated database technology” will allow for a blockchain-based system for storing a registry of who owns what land, creating an elaborate framework including concepts such as homesteading, adverse possession and Georgian land tax.

2005 年，Nick Szabo 提出了“[secure property titles with owner authority](https://nakamotoinstitute.org/library/secure-property-titles/)”这一概念。在该文中，他描述了“复制数据库技术的新进展”将如何使基于 blockchain 的土地所有权登记系统成为可能，并构建了一个包含 homesteading、adverse possession 和 Georgian land tax 等概念的精细框架。

However, there was unfortunately no effective replicated database system available at the time, and so the protocol was never implemented in practice.

然而，不幸的是，当时并不存在真正有效的 replicated database system，因此该协议从未在实践中得到实现。

After 2009, however, once Bitcoin’s decentralized consensus was developed a number of alternative applications rapidly began to emerge.

但在 2009 年之后，随着 Bitcoin 的去中心化共识机制被开发出来，大量替代性应用便迅速开始涌现。

- **Namecoin** - created in 2010, [Namecoin](https://namecoin.org/) is best described as a decentralized name registration database.  In decentralized protocols like Tor, Bitcoin and BitMessage, there needs to be some way of identifying accounts so that other people can interact with them, but in all existing solutions the only kind of identifier available is a pseudo-random hash like `1LW79wp5ZBqaHW1jL5TCiBCrhQYtHagUWy`.  Ideally, one would like to be able to have an account with a name like “george”.  However, the problem is that if one person can create an account named “george” then someone else can use the same process to register “george” for themselves as well and impersonate them.  The only solution is a first-to-file paradigm, where the first registerer succeeds and the second fails - a problem perfectly suited for the Bitcoin consensus protocol.  Namecoin is the oldest, and most successful, implementation of a name registration system using such an idea.
  **Namecoin** - 创建于 2010 年，[Namecoin](https://namecoin.org/) 最适合被描述为一个去中心化的名称注册数据库。在 Tor、Bitcoin 和 BitMessage 这类去中心化协议中，必须有某种方式来标识账户，以便其他人能够与之交互；但在现有方案中，唯一可用的标识符通常只是类似 `1LW79wp5ZBqaHW1jL5TCiBCrhQYtHagUWy` 这样的伪随机 hash。理想情况下，人们希望能够拥有一个名为“george”的账户。然而问题在于，如果一个人可以创建名为“george”的账户，那么另一个人也可以用同样的流程为自己注册“george”，并冒充前者。唯一的解决方式是采用先到先得的范式，即第一个注册者成功、第二个失败，而这正是 Bitcoin 共识协议非常适合处理的问题。Namecoin 是使用这一思想构建的最早、也最成功的名称注册系统实现。
- **Colored coins** - the purpose of [colored coins](https://docs.google.com/a/buterin.com/document/d/1AnkP_cVZTCMLIzw4DvsW6M8Q2JC0lIzrTLuoWu2z1BE/edit) is to serve as a protocol to allow people to create their own digital currencies - or, in the important trivial case of a currency with one unit, digital tokens, on the Bitcoin blockchain.  In the colored coins protocol, one “issues” a new currency by publicly assigning a color to a specific Bitcoin UTXO, and the protocol recursively defines the color of other UTXO to be the same as the color of the inputs that the transaction creating them spent (some special rules apply in the case of mixed-color inputs).  This allows users to maintain wallets containing only UTXO of a specific color and send them around much like regular bitcoins, backtracking through the blockchain to determine the color of any UTXO that they receive.
  **Colored coins** - [colored coins](https://docs.google.com/a/buterin.com/document/d/1AnkP_cVZTCMLIzw4DvsW6M8Q2JC0lIzrTLuoWu2z1BE/edit) 的目的是作为一种协议，使人们能够在 Bitcoin blockchain 上创建自己的数字货币，或者在一个重要而简单的特例中，创建单位为 1 的数字 token。 在 colored coins 协议中，人们通过公开地给某个特定 Bitcoin UTXO 赋予一种颜色来“发行”新货币，而协议会递归地将其他 UTXO 的颜色定义为创建它们的 transaction 所花费 inputs 的颜色（在输入颜色混合的情况下会有一些特殊规则）。这使得用户可以维护只包含某种特定颜色 UTXO 的钱包，并像转移普通 bitcoin 一样转移它们，同时通过回溯 blockchain 来确定自己收到的任意 UTXO 的颜色。
- **Metacoins** - the idea behind a metacoin is to have a protocol that lives on top of Bitcoin, using Bitcoin transactions to store metacoin transactions but having a different state transition function, `APPLY'`.  Because the metacoin protocol cannot prevent invalid metacoin transactions from appearing in the Bitcoin blockchain, a rule is added that if `APPLY'(S, TX)` returns an error, the protocol defaults to `APPLY'(S, TX) = S`.  This provides an easy mechanism for creating an arbitrary cryptocurrency protocol, potentially with advanced features that cannot be implemented inside of Bitcoin itself, but with a very low development cost since the complexities of mining and networking are already handled by the Bitcoin protocol.  Metacoins have been used to implement some classes of financial contracts, name registration and decentralized exchange.
  **Metacoins** - metacoin 背后的想法，是构建一个运行在 Bitcoin 之上的协议：它使用 Bitcoin transactions 来存储 metacoin transactions，但拥有不同的状态转移函数 `APPLY'`。由于 metacoin 协议无法阻止无效的 metacoin transaction 出现在 Bitcoin blockchain 中，因此增加了一条规则：如果 `APPLY'(S, TX)` 返回错误，则协议默认 `APPLY'(S, TX) = S`。这为创建任意 cryptocurrency 协议提供了一种简单机制，并且还可能支持一些无法直接在 Bitcoin 内部实现的高级特性；同时其开发成本很低，因为 mining 和 networking 的复杂性已经由 Bitcoin 协议处理。Metacoins 已被用于实现某些类型的金融合约、名称注册和去中心化交易。

> **三种路径的比较**<br />
> (1) 独立链 (e.g., Namecoin): 自由度最大, 但需自行冷启动网络, 安全性从零开始积累.
> (2) Bitcoin Script: 实现简单, 但 Bitcoin 脚本能力太有限 (非 Turing-complete, 无状态).
> (3) Meta-protocol (e.g., Colored Coins, Mastercoin): 复用 Bitcoin 安全性, 但无法使用 SPV, light client 必须信任第三方.
> Ethereum 的目标是结合 (1) 的自由度与 (2)/(3) 的安全性共享.

Thus, in general, there are two approaches toward building a consensus protocol: building an independent network, and building a protocol on top of Bitcoin.

因此，总体来看，构建共识协议有两种路径：构建一个独立网络，或者在 Bitcoin 之上构建协议。

The former approach, while reasonably successful in the case of applications like Namecoin, is difficult to implement; each individual implementation needs to bootstrap an independent blockchain, as well as building and testing all of the necessary state transition and networking code.

前一种方法虽然在 Namecoin 这类应用中取得了一定成功，但实现起来很困难；每个独立实现都需要自行启动一条独立的 blockchain，并构建、测试所有必需的状态转移和 networking 代码。

Additionally, we predict that the set of applications for decentralized consensus technology will follow a power law distribution where the vast majority of applications would be too small to warrant their own blockchain, and we note that there exist large classes of decentralized applications, particularly decentralized autonomous organizations, that need to interact with each other.

此外，我们预测去中心化共识技术的应用集合将遵循幂律分布，其中绝大多数应用规模都太小，不值得拥有自己的 blockchain；同时我们也注意到，有很大一类去中心化应用，尤其是 decentralized autonomous organizations，需要彼此交互。

The Bitcoin-based approach, on the other hand, has the flaw that it does not inherit the simplified payment verification features of Bitcoin.

另一方面，基于 Bitcoin 的方法存在一个缺陷，即它无法继承 Bitcoin 的 simplified payment verification 特性。

SPV works for Bitcoin because it can use blockchain depth as a proxy for validity; at some point, once the ancestors of a transaction go far enough back, it is safe to say that they were legitimately part of the state.

SPV 之所以适用于 Bitcoin，是因为它可以把 blockchain 的深度当作有效性的代理指标；当某笔 transaction 的祖先足够“深”时，就可以安全地认为它们确实是 state 的合法组成部分。

Blockchain-based meta-protocols, on the other hand, cannot force the blockchain not to include transactions that are not valid within the context of their own protocols.

而基于 blockchain 的 meta-protocol 则无法强制 blockchain 排除那些在其自身协议上下文中无效的 transactions。

Hence, a fully secure SPV meta-protocol implementation would need to backward scan all the way to the beginning of the Bitcoin blockchain to determine whether or not certain transactions are valid.

因此，一个完全安全的 SPV meta-protocol 实现，必须一路向后扫描直到 Bitcoin blockchain 的起点，才能判断某些 transactions 是否有效。

Currently, all “light” implementations of Bitcoin-based meta-protocols rely on a trusted server to provide the data, arguably a highly suboptimal result especially when one of the primary purposes of a cryptocurrency is to eliminate the need for trust.

目前，所有 Bitcoin-based meta-protocol 的“light”实现都依赖可信服务器来提供数据；考虑到 cryptocurrency 的主要目标之一正是消除信任需求，这显然是一个相当不理想的结果。

### Scripting

Even without any extensions, the Bitcoin protocol actually does facilitate a weak version of a concept of “smart contracts”.

即便完全不做扩展，Bitcoin 协议实际上也支持一种较弱版本的“smart contracts”概念。

UTXO in Bitcoin can be owned not just by a public key, but also by a more complicated script expressed in a simple stack-based programming language.

Bitcoin 中的 UTXO 不仅可以由公钥拥有，还可以由一种用简单基于栈的编程语言编写的更复杂脚本所拥有。

In this paradigm, a transaction spending that UTXO must provide data that satisfies the script.

在这种范式下，花费该 UTXO 的 transaction 必须提供能够满足该脚本的数据。

Indeed, even the basic public key ownership mechanism is implemented via a script: the script takes an elliptic curve signature as input, verifies it against the transaction and the address that owns the UTXO, and returns 1 if the verification is successful and 0 otherwise.

实际上，就连最基础的公钥所有权机制也是通过脚本实现的：脚本接收一个椭圆曲线签名作为输入，根据 transaction 和拥有该 UTXO 的地址进行验证，验证成功则返回 1，否则返回 0。

> **Bitcoin Script 的运作**<br />
> 最常见的脚本类型是 P2PKH (Pay-to-Public-Key-Hash).
> 锁定脚本 (放在 UTXO 中): “谁能提供与这个 hash 匹配的公钥和有效签名, 谁就能花这笔钱.”
> 解锁脚本 (放在花费交易中): “这是我的公钥和签名.”
> 验证时把两段脚本拼在一起, 在栈上执行, 如果最终结果为 true 则合法.

Other, more complicated, scripts exist for various additional use cases.

此外，还存在更复杂的脚本，用于支持各种额外场景。

For example, one can construct a script that requires signatures from two out of a given three private keys to validate (“multisig”), a setup useful for corporate accounts, secure savings accounts and some merchant escrow situations.

例如，可以构造一个脚本，要求给定三个私钥中的任意两个签名才能通过验证（“multisig”）；这种设置对企业账户、安全储蓄账户以及某些商家托管场景都很有用。

Scripts can also be used to pay bounties for solutions to computational problems, and one can even construct a script that says something like “this Bitcoin UTXO is yours if you can provide an SPV proof that you sent a Dogecoin transaction of this denomination to me”, essentially allowing decentralized cross-cryptocurrency exchange.

脚本还可以用于为计算问题的解答支付赏金，甚至可以构造出类似“如果你能提供一个 SPV 证明，证明你向我发送了一笔该面额的 Dogecoin transaction，那么这个 Bitcoin UTXO 就归你所有”这样的脚本，本质上实现去中心化的跨 cryptocurrency 交换。

However, the scripting language as implemented in Bitcoin has several important limitations:

然而，Bitcoin 中实现的 scripting language 存在若干重要限制：

- **Lack of Turing-completeness** - that is to say, while there is a large subset of computation that the Bitcoin scripting language supports, it does not nearly support everything.  The main category that is missing is loops.  This is done to avoid infinite loops during transaction verification; theoretically it is a surmountable obstacle for script programmers, since any loop can be simulated by simply repeating the underlying code many times with an if statement, but it does lead to scripts that are very space-inefficient.  For example, implementing an alternative elliptic curve signature algorithm would likely require 256 repeated multiplication rounds all individually included in the code.
  **Lack of Turing-completeness** - 也就是说，尽管 Bitcoin scripting language 支持相当大一部分计算能力，但它远远不能支持一切。缺失的主要类别是循环。这样设计是为了避免在 transaction 验证期间出现无限循环；从理论上说，这对脚本程序员而言并非不可逾越，因为任何循环都可以通过带有 if 语句的底层代码多次重复来模拟，但这会导致脚本在空间上极其低效。例如，实现一种替代的椭圆曲线签名算法，可能需要把 256 次重复乘法轮次逐个写进代码中。
- **Value-blindness** - there is no way for a UTXO script to provide fine-grained control over the amount that can be withdrawn.  For example, one powerful use case of an oracle contract would be a hedging contract, where A and B put in $1000 worth of BTC and after 30 days the script sends $1000 worth of BTC to A and the rest to B.  This would require an oracle to determine the value of 1 BTC in USD, but even then it is a massive improvement in terms of trust and infrastructure requirement over the fully centralized solutions that are available now.  However, because UTXO are all-or-nothing, the only way to achieve this is through the very inefficient hack of having many UTXO of varying denominations (e.g., one UTXO of 2<sup>k</sup> for every k up to 30) and having the oracle pick which UTXO to send to A and which to B.
  **Value-blindness** - UTXO 脚本无法对可提取的金额进行细粒度控制。例如，oracle contract 的一个强大用例可以是对冲合约：A 和 B 各自投入价值 $1000 的 BTC，30 天后脚本向 A 发送价值 $1000 的 BTC，其余部分发送给 B。这需要一个 oracle 来确定 1 BTC 相对于 USD 的价值，但即便如此，相比当前可用的完全中心化方案，它在信任和基础设施要求方面仍然是巨大进步。然而，由于 UTXO 只能整体花费，唯一的实现方式是使用一种非常低效的变通办法：预先准备许多不同面额的 UTXO（例如，对每个不超过 30 的 k，都有一个 2<sup>k</sup> 面额的 UTXO），再让 oracle 选择哪些 UTXO 发送给 A、哪些发送给 B。
- **Lack of state** - UTXO can either be spent or unspent; there is no opportunity for multi-stage contracts or scripts which keep any other internal state beyond that.  This makes it hard to make multi-stage options contracts, decentralized exchange offers or two-stage cryptographic commitment protocols (necessary for secure computational bounties).  It also means that UTXO can only be used to build simple, one-off contracts and not more complex “stateful” contracts such as decentralized organizations, and makes meta-protocols difficult to implement.  Binary state combined with value-blindness also mean that another important application, withdrawal limits, is impossible.
  **Lack of state** - UTXO 要么已花费，要么未花费；除此之外，它没有机会保存任何内部状态，因此无法自然支持多阶段合约或多阶段脚本。这使得构造多阶段期权合约、去中心化交易报价或两阶段密码学承诺协议（安全计算赏金所必需）都变得困难。它还意味着 UTXO 只能用于构建简单的一次性合约，而不能用于更复杂的“stateful”合约，例如去中心化组织，也让 meta-protocol 难以实现。二元状态再加上 value-blindness，也使得另一个重要应用场景，即提现限额，无法实现。
- **Blockchain-blindness** - UTXO are blind to blockchain data such as the nonce, the timestamp and previous block hash.  This severely limits applications in gambling, and several other categories, by depriving the scripting language of a potentially valuable source of randomness.
  **Blockchain-blindness** - UTXO 对诸如 nonce、timestamp 和前一个 block hash 等 blockchain 数据毫无感知。这使 scripting language 失去了一种潜在很有价值的随机性来源，从而严重限制了赌博以及其他若干类别应用。

> **Bitcoin Script 四大限制总结**<br />
> 这四条限制恰好对应了 Ethereum 的四个设计目标:
> (1) Lack of Turing-completeness → Ethereum 提供 Turing-complete 的 EVM.
> (2) Value-blindness → Ethereum 的 contract 可以检查并控制精确的 ether 金额.
> (3) Lack of state → Ethereum 的 contract 有持久化的 key-value storage.
> (4) Blockchain-blindness → Ethereum 的 contract 可以访问 block number, timestamp, difficulty 等链上数据.
> 这四点的克服, 正是 Ethereum 相比 Bitcoin 在可编程性上的质变.

Thus, we see three approaches to building advanced applications on top of cryptocurrency: building a new blockchain, using scripting on top of Bitcoin, and building a meta-protocol on top of Bitcoin.

因此，我们可以看到，在 cryptocurrency 之上构建高级应用有三条路径：创建一条新的 blockchain、在 Bitcoin 之上使用 scripting，以及在 Bitcoin 之上构建 meta-protocol。

Building a new blockchain allows for unlimited freedom in building a feature set, but at the cost of development time, bootstrapping effort and security.

创建新的 blockchain 在功能设计上拥有无限自由，但代价是开发时间、冷启动成本以及安全性负担。

Using scripting is easy to implement and standardize, but is very limited in its capabilities, and meta-protocols, while easy, suffer from faults in scalability.

使用 scripting 易于实现和标准化，但能力非常有限；而 meta-protocol 虽然同样容易实现，却存在可扩展性方面的缺陷。

With Ethereum, we intend to build an alternative framework that provides even larger gains in ease of development as well as even stronger light client properties, while at the same time allowing applications to share an economic environment and blockchain security.

通过 Ethereum，我们打算构建一种替代性框架，它在开发便利性上带来更大提升，同时具备更强的 light client 属性，并且允许各类应用共享同一经济环境和 blockchain 安全性。

> **共享安全性 (shared security)**<br />
> 这是 Ethereum 相比“每个应用建自己的链”的关键优势.
> 所有运行在 Ethereum 上的应用都共享整个网络的安全性, 无需各自冷启动.
> 这一思想后来成为 Layer 2 和 rollup 生态的理论基础.

## Ethereum

The intent of Ethereum is to create an alternative protocol for building decentralized applications, providing a different set of tradeoffs that we believe will be very useful for a large class of decentralized applications, with particular emphasis on situations where rapid development time, security for small and rarely used applications, and the ability of different applications to very efficiently interact, are important.

Ethereum 的目标，是为构建 decentralized applications 创建一种替代性协议，提供一组我们认为对大量 decentralized applications 都非常有用的权衡，尤其适用于那些重视快速开发、小型和低频应用的安全性，以及不同应用之间高效交互能力的场景。

Ethereum does this by building what is essentially the ultimate abstract foundational layer: a blockchain with a built-in Turing-complete programming language, allowing anyone to write smart contracts and decentralized applications where they can create their own arbitrary rules for ownership, transaction formats and state transition functions.

Ethereum 实现这一点的方式，是构建一个可以说接近终极抽象基础层的系统：一条内建 Turing-complete 编程语言的 blockchain，使任何人都能编写 smart contracts 和 decentralized applications，并在其中定义任意的所有权规则、transaction 格式和状态转移函数。

> **Ethereum 章节导语**<br />
> 本章进入 Ethereum 自身的设计.
> 核心思路: 不针对任何具体应用做优化, 而是提供最底层的、通用的可编程能力.
> 这类似于操作系统的理念: OS 不关心你用它做什么, 它只提供进程、内存、文件系统等基础抽象.

A bare-bones version of Namecoin can be written in two lines of code, and other protocols like currencies and reputation systems can be built in under twenty.

一个最简版本的 Namecoin 只需两行代码即可写出，而货币、信誉系统等其他协议也可以在不到二十行代码内构建出来。

Smart contracts, cryptographic “boxes” that contain value and only unlock it if certain conditions are met, can also be built on top of the platform, with vastly more power than that offered by Bitcoin scripting because of the added powers of Turing-completeness, value-awareness, blockchain-awareness and state.

smart contracts 也可以构建在这一平台之上。它们是装有价值、并且只在满足特定条件时才会解锁的密码学“盒子”；由于 Ethereum 额外具备 Turing-completeness、value-awareness、blockchain-awareness 和 state 等能力，它们相比 Bitcoin scripting 所能提供的功能要强大得多。

### Ethereum Accounts

In Ethereum, the state is made up of objects called “accounts”, with each account having a 20-byte address and state transitions being direct transfers of value and information between accounts.

在 Ethereum 中，state 由称为 “accounts” 的对象构成，每个 account 都有一个 20-byte 地址，而状态转移则表现为 accounts 之间价值和信息的直接转移。

> **account model vs UTXO model**<br />
> 这是 Ethereum 与 Bitcoin 最根本的架构差异之一.
> Bitcoin (UTXO): 没有“账户”概念, state 是一堆散落的 UTXO. 每次交易都消耗旧 UTXO、产生新 UTXO.
> Ethereum (Account): 明确维护每个账户的余额和状态. 转账直接修改余额, 更接近传统银行系统的心智模型.
> Account model 更直观, 也更容易支持 smart contract 的复杂状态管理, 但需要额外机制防止 replay attack (因此有 nonce).

An Ethereum account contains four fields:

一个 Ethereum account 包含四个字段：

- The **nonce**, a counter used to make sure each transaction can only be processed once
  **nonce**，一个计数器，用于确保每笔 transaction 只能被处理一次。
- The account’s current **ether balance**
  该 account 当前的 **ether balance**。
- The account’s **contract code**, if present
  该 account 的 **contract code**（如果存在）。
- The account’s **storage** (empty by default)
  该 account 的 **storage**（默认为空）。

“Ether” is the main internal crypto-fuel of Ethereum, and is used to pay transaction fees.

“Ether” 是 Ethereum 的主要内部 crypto-fuel，用于支付 transaction fees。

In general, there are two types of accounts: **externally owned accounts**, controlled by private keys, and **contract accounts**, controlled by their contract code.

一般来说，accounts 有两种类型：由私钥控制的 **externally owned accounts**，以及由其 contract code 控制的 **contract accounts**。

> **EOA vs Contract Account**<br />
> EOA (Externally Owned Account): 由真人 (或软件) 通过私钥控制, 可以主动发起交易.
> Contract Account: 没有私钥, 只能被动响应. 一旦收到 message 或 transaction, 就自动执行预设代码.
> 一个关键区别: 只有 EOA 能发起 transaction (即“第一推动力”). Contract 之间虽然可以互相调用, 但整条调用链的起点必须是 EOA.

An externally owned account has no code, and one can send messages from an externally owned account by creating and signing a transaction; in a contract account, every time the contract account receives a message its code activates, allowing it to read and write to internal storage and send other messages or create contracts in turn.

externally owned account 不包含代码，人们可以通过创建并签名一笔 transaction，从 externally owned account 发送 messages；而对于 contract account，每当它收到一条 message，其代码就会被激活，从而读取和写入内部 storage，并继续发送其他 messages 或创建 contracts。

Note that “contracts” in Ethereum should not be seen as something that should be “fulfilled” or “complied with”; rather, they are more like “autonomous agents” that live inside of the Ethereum execution environment, always executing a specific piece of code when “poked” by a message or transaction, and having direct control over their own ether balance and their own key/value store to keep track of persistent variables.

需要注意的是，Ethereum 中的 “contracts” 不应被视为某种需要“履行”或“遵守”的东西；更准确地说，它们更像是生活在 Ethereum 执行环境内部的“autonomous agents”，每当被 message 或 transaction “触发”时，就执行一段特定代码，并且直接控制自己的 ether balance 以及自己的键值存储，以记录持久变量。

> **contract 不是法律合同**<br />
> 这一点非常重要.
> “smart contract” 这个名字容易产生误导: 它既不“智能”, 也不是法律意义上的“合同”.
> 它只是一段自动执行的代码, 类似于自动贩卖机或 ATM 的程序.
> 一旦部署, 代码就不可更改 (除非预先设计了升级机制), 且任何人都可以调用.

### Messages and Transactions

The term “transaction” is used in Ethereum to refer to the signed data package that stores a message to be sent from an externally owned account.

在 Ethereum 中，“transaction” 一词指的是一种已签名的数据包，它保存着一条将从 externally owned account 发送出去的 message。

Transactions contain:

Transactions 包含：

- The recipient of the message
  消息的接收者。
- A signature identifying the sender
  用于标识发送者的签名。
- The amount of ether to transfer from the sender to the recipient
  从发送者转给接收者的 ether 数量。
- An optional data field
  一个可选的数据字段。
- A `STARTGAS` value, representing the maximum number of computational steps the transaction execution is allowed to take
  一个 `STARTGAS` 值，表示该 transaction 执行所允许消耗的最大计算步数。
- A `GASPRICE` value, representing the fee the sender pays per computational step
  一个 `GASPRICE` 值，表示发送者为每个计算步骤支付的费用。

The first three are standard fields expected in any cryptocurrency.

前三项是任何 cryptocurrency 中都会出现的标准字段。

The data field has no function by default, but the virtual machine has an opcode using which a contract can access the data; as an example use case, if a contract is functioning as an on-blockchain domain registration service, then it may wish to interpret the data being passed to it as containing two “fields”, the first field being a domain to register and the second field being the IP address to register it to.

data field 默认没有任何功能，但 virtual machine 提供了一个 opcode，使 contract 可以访问这些数据；举个例子，如果某个 contract 作为链上域名注册服务运行，那么它可能希望把传入的数据解释为包含两个“fields”：第一个 field 是要注册的域名，第二个 field 是要绑定的 IP 地址。

The contract would read these values from the message data and appropriately place them in storage.

该 contract 会从 message data 中读取这些值，并将它们正确地写入 storage。

The `STARTGAS` and `GASPRICE` fields are crucial for Ethereum’s anti-denial of service model.

`STARTGAS` 和 `GASPRICE` 字段对于 Ethereum 的 anti-denial of service 模型至关重要。

In order to prevent accidental or hostile infinite loops or other computational wastage in code, each transaction is required to set a limit to how many computational steps of code execution it can use.

为了防止代码中出现意外或恶意的无限循环，或者其他计算资源浪费，每笔 transaction 都必须设定其代码执行最多可使用多少计算步骤。

The fundamental unit of computation is “gas”; usually, a computational step costs 1 gas, but some operations cost higher amounts of gas because they are more computationally expensive, or increase the amount of data that must be stored as part of the state.

计算的基本单位是 “gas”；通常一次计算步骤消耗 1 gas，但某些操作会消耗更多 gas，因为它们在计算上更昂贵，或者会增加必须作为 state 一部分被存储的数据量。

> **gas (燃料)**<br />
> gas 是 Ethereum 最精妙的设计之一, 它解耦了“计算成本”和“ETH 价格”.
> gas 用量由操作类型决定 (e.g., 加法 3 gas, 存储写入 20000 gas), 与 ETH 价格无关.
> 用户通过 gas price 出价, 矿工优先打包出价高的交易 — 这是一个公开竞价市场.

> **现实实现**<br />
> 白皮书中描述的是最初的 gas 模型.
> 2021 年 EIP-1559 (London 硬分叉) 彻底改革了 fee 模型:
> 引入 base fee (由协议自动调节, 被销毁) + priority fee (小费, 给验证者).
> 这使 gas price 更可预测, 并让 ETH 成为一种可能通缩的资产.

There is also a fee of 5 gas for every byte in the transaction data.

此外，transaction data 中每个 byte 还需要支付 5 gas 的费用。

The intent of the fee system is to require an attacker to pay proportionately for every resource that they consume, including computation, bandwidth and storage; hence, any transaction that leads to the network consuming a greater amount of any of these resources must have a gas fee roughly proportional to the increment.

该费用系统的目标，是要求攻击者为其消耗的每一种资源按比例付费，包括计算、带宽和存储；因此，任何会让网络在这些资源上消耗更多的 transaction，都必须支付与增量大致成比例的 gas fee。

### Messages

Contracts have the ability to send “messages” to other contracts.

contracts 具备向其他 contracts 发送 “messages” 的能力。

Messages are virtual objects that are never serialized and exist only in the Ethereum execution environment.

messages 是虚拟对象，它们从不会被序列化，只存在于 Ethereum 执行环境中。

A message contains:

一条 message 包含：

- The sender of the message (implicit)
  消息的发送者（隐式给出）。
- The recipient of the message
  消息的接收者。
- The amount of ether to transfer alongside the message
  随消息一并转移的 ether 数量。
- An optional data field
  一个可选的数据字段。
- A `STARTGAS` value
  一个 `STARTGAS` 值。

Essentially, a message is like a transaction, except it is produced by a contract and not an external actor.

本质上，message 很像一笔 transaction，只不过它是由 contract 产生的，而不是由外部参与者发起的。

> **transaction vs message**<br />
> Transaction: 由 EOA 发起, 有签名, 要花 gas, 会被记录在 blockchain 上.
> Message (又称 internal transaction): 由 contract 代码发起, 没有签名, 不单独记录在链上, 但共享父 transaction 的 gas 配额.
> 在 block explorer (如 Etherscan) 中, messages 显示在 “Internal Transactions” 标签下.

A message is produced when a contract currently executing code executes the `CALL` opcode, which produces and executes a message.

当一个正在执行代码的 contract 执行 `CALL` opcode 时，就会产生并执行一条 message。

Like a transaction, a message leads to the recipient account running its code.

和 transaction 一样，message 会导致接收方 account 运行其代码。

Thus, contracts can have relationships with other contracts in exactly the same way that external actors can.

因此，contracts 可以像外部参与者那样，以完全相同的方式与其他 contracts 建立关系。

Note that the gas allowance assigned by a transaction or contract applies to the total gas consumed by that transaction and all sub-executions.

需要注意的是，由 transaction 或 contract 分配的 gas 配额，适用于该 transaction 以及其所有子执行所消耗的 gas 总量。

For example, if an external actor A sends a transaction to B with 1000 gas, and B consumes 600 gas before sending a message to C, and the internal execution of C consumes 300 gas before returning, then B can spend another 100 gas before running out of gas.

例如，如果外部参与者 A 向 B 发送了一笔携带 1000 gas 的 transaction，而 B 在向 C 发送一条 message 之前已经消耗了 600 gas，接着 C 的内部执行在返回前又消耗了 300 gas，那么 B 在 gas 耗尽之前还可以再花费 100 gas。

### Ethereum State Transition Function

![Ether state transition](https://ethereum.org/content/whitepaper/ether-state-transition.png)

The Ethereum state transition function, `APPLY(S, TX) -> S'` can be defined as follows:

Ethereum 的状态转移函数 `APPLY(S, TX) -> S'` 可以定义如下：

1. Check if the transaction is well-formed (i.e., has the right number of values), the signature is valid, and the nonce matches the nonce in the sender’s account.  If not, return an error.
   检查 transaction 是否格式正确（即字段数量是否正确）、签名是否有效，以及 nonce 是否与发送者 account 中的 nonce 匹配。如果不满足，则返回错误。
2. Calculate the transaction fee as `STARTGAS * GASPRICE`, and determine the sending address from the signature.  Subtract the fee from the sender’s account balance and increment the sender’s nonce.  If there is not enough balance to spend, return an error.
   将 transaction fee 计算为 `STARTGAS * GASPRICE`，并从签名中确定发送地址。从发送者的 account balance 中扣除该费用，并将发送者的 nonce 加一。如果余额不足以支付，则返回错误。
3. Initialize `GAS = STARTGAS`, and take off a certain quantity of gas per byte to pay for the bytes in the transaction.
   初始化 `GAS = STARTGAS`，然后按每个 byte 扣除一定数量的 gas，以支付 transaction 中字节数据的开销。
4. Transfer the transaction value from the sender’s account to the receiving account.  If the receiving account does not yet exist, create it.  If the receiving account is a contract, run the contract’s code either to completion or until the execution runs out of gas.
   将 transaction 的 value 从发送者 account 转移到接收者 account。如果接收者 account 尚不存在，则创建之。如果接收者 account 是 contract，则运行该 contract 的代码，直到执行完成或耗尽 gas。
5. If the value transfer failed because the sender did not have enough money, or the code execution ran out of gas, revert all state changes except the payment of the fees, and add the fees to the miner’s account.
   如果 value 转移失败，原因是发送者资金不足，或者代码执行耗尽了 gas，那么除费用支付之外的所有 state 更改都要回滚，并把这些费用加入 miner 的 account。
6. Otherwise, refund the fees for all remaining gas to the sender, and send the fees paid for gas consumed to the miner.
   否则，把剩余 gas 对应的费用退还给发送者，并把已消耗 gas 的费用支付给 miner。

For example, suppose that the contract’s code is:

例如，假设 contract 的代码如下：

```py
if !self.storage[calldataload(0)]:
    self.storage[calldataload(0)] = calldataload(32)
```

Note that in reality the contract code is written in the low-level EVM code; this example is written in Serpent, one of our high-level languages, for clarity, and can be compiled down to EVM code.

需要注意，现实中的 contract code 是用底层 EVM code 编写的；这里为了说明清晰，使用了我们的高级语言之一 Serpent 来写这个例子，它可以被编译为 EVM code。

Suppose that the contract’s storage starts off empty, and a transaction is sent with 10 ether value, 2000 gas, 0.001 ether gasprice, and 64 bytes of data, with bytes 0-31 representing the number `2` and bytes 32-63 representing the string `CHARLIE`.

假设该 contract 的 storage 初始为空，并且收到一笔带有 10 ether value、2000 gas、0.001 ether gasprice 以及 64 bytes data 的 transaction，其中 bytes 0-31 表示数字 `2`，bytes 32-63 表示字符串 `CHARLIE`。

The process for the state transition function in this case is as follows:

在这种情况下，状态转移函数的处理过程如下：

1. Check that the transaction is valid and well formed.
   检查 transaction 是否有效且格式正确。
2. Check that the transaction sender has at least 2000 \* 0.001 = 2 ether.  If it is, then subtract 2 ether from the sender’s account.
   检查 transaction 发送者是否至少拥有 2000 \* 0.001 = 2 ether。如果满足，则从发送者 account 中扣除 2 ether。
3. Initialize gas = 2000; assuming the transaction is 170 bytes long and the byte-fee is 5, subtract 850 so that there is 1150 gas left.
   初始化 gas = 2000；假设该 transaction 长 170 bytes，且每字节费用为 5，则扣除 850，剩余 1150 gas。
4. Subtract 10 more ether from the sender’s account, and add it to the contract’s account.
   再从发送者 account 中扣除 10 ether，并加到该 contract 的 account 上。
5. Run the code.  In this case, this is simple: it checks if the contract’s storage at index `2` is used, notices that it is not, and so it sets the storage at index `2` to the value `CHARLIE`.  Suppose this takes 187 gas, so the remaining amount of gas is 1150 - 187 = 963
   运行代码。在本例中，这一步很简单：它检查 contract 的 storage 中索引 `2` 是否已被使用，发现没有，于是将索引 `2` 对应的 storage 设置为 `CHARLIE`。假设这一步消耗了 187 gas，那么剩余 gas 就是 1150 - 187 = 963。
6. Add 963 \* 0.001 = 0.963 ether back to the sender’s account, and return the resulting state.
   将 963 \* 0.001 = 0.963 ether 退回给发送者 account，并返回最终得到的 state。

If there was no contract at the receiving end of the transaction, then the total transaction fee would simply be equal to the provided `GASPRICE` multiplied by the length of the transaction in bytes, and the data sent alongside the transaction would be irrelevant.

如果 transaction 的接收端并不存在 contract，那么总 transaction fee 就只是提供的 `GASPRICE` 乘以 transaction 的字节长度，而随 transaction 一起发送的数据则没有意义。

Note that messages work equivalently to transactions in terms of reverts: if a message execution runs out of gas, then that message’s execution, and all other executions triggered by that execution, revert, but parent executions do not need to revert.

需要注意，在回滚行为上，messages 与 transactions 的工作方式是等价的：如果一条 message 的执行耗尽了 gas，那么这条 message 的执行以及由它触发的所有其他执行都会回滚，但父级执行本身不必回滚。

This means that it is “safe” for a contract to call another contract, as if A calls B with G gas then A’s execution is guaranteed to lose at most G gas.

这意味着 contract 调用另一个 contract 在这种意义上是“安全”的：如果 A 用 G gas 调用 B，那么 A 的执行最多只会损失 G gas。

> **gas 限制保证调用安全**<br />
> 这是一个重要的隔离机制.
> 调用者可以通过限制分配给被调用 contract 的 gas, 来防止被调用方消耗过多资源.
> 但要注意: gas 限制只保护计算资源, 不保护状态一致性.
> 2016 年 The DAO 攻击就利用了 “重入漏洞” (reentrancy) 在 gas 充足的情况下窃取资金.

Finally, note that there is an opcode, `CREATE`, that creates a contract; its execution mechanics are generally similar to `CALL`, with the exception that the output of the execution determines the code of a newly created contract.

最后，注意还有一个用于创建 contract 的 opcode，`CREATE`；它的执行机制总体上与 `CALL` 类似，不同之处在于，执行结果会决定新创建 contract 的代码内容。

### Code Execution

The code in Ethereum contracts is written in a low-level, stack-based bytecode language, referred to as “Ethereum virtual machine code” or “EVM code”.

Ethereum contracts 中的代码是用一种低层级、基于栈的 bytecode 语言编写的，这种语言被称为 “Ethereum virtual machine code” 或 “EVM code”。

The code consists of a series of bytes, where each byte represents an operation.

代码由一系列 bytes 构成，其中每一个 byte 都代表一个操作。

In general, code execution is an infinite loop that consists of repeatedly carrying out the operation at the current program counter (which begins at zero) and then incrementing the program counter by one, until the end of the code is reached or an error or `STOP` or `RETURN` instruction is detected.

一般来说，代码执行是一个无限循环：不断执行当前 program counter 所指向的操作（初始为零），然后将 program counter 加一，直到到达代码末尾，或者检测到错误、`STOP` 或 `RETURN` 指令为止。

The operations have access to three types of space in which to store data:

这些操作可以访问三类用于存储数据的空间：

> **EVM 的三层存储**<br />
> 理解 EVM 的存储模型是理解 gas 成本的关键:
> (1) Stack: 最便宜, 临时变量, 函数结束即消失.
> (2) Memory: 中等成本, 本次 transaction 执行期间有效, 按需扩展 (扩展越大越贵).
> (3) Storage: 最昂贵 (写入约 20000 gas), 永久存储在 blockchain 上, 所有节点都得保存.
> 这就是为什么 Solidity 开发者总在优化 storage 使用量.

- The **stack**, a last-in-first-out container to which values can be pushed and popped
  **stack**，一个后进先出的容器，值可以被压入和弹出。
- **Memory**, an infinitely expandable byte array
  **Memory**，一个可无限扩展的 byte array。
- The contract’s long-term **storage**, a key/value store.  Unlike stack and memory, which reset after computation ends, storage persists for the long term.
  contract 的长期 **storage**，即一个 key/value store。与计算结束后会被重置的 stack 和 memory 不同，storage 会长期持久存在。

The code can also access the value, sender and data of the incoming message, as well as block header data, and the code can also return a byte array of data as an output.

代码还可以访问传入 message 的 value、sender 和 data，以及 block header data；此外，代码也可以返回一个 byte array 作为输出。

The formal execution model of EVM code is surprisingly simple.

EVM code 的形式化执行模型出奇地简单。

While the Ethereum virtual machine is running, its full computational state can be defined by the tuple `(block_state, transaction, message, code, memory, stack, pc, gas)`, where `block_state` is the global state containing all accounts and includes balances and storage.

当 Ethereum virtual machine 运行时，它的完整计算状态可以定义为元组 `(block_state, transaction, message, code, memory, stack, pc, gas)`，其中 `block_state` 是包含所有 accounts 的全局 state，并包含 balances 与 storage。

At the start of every round of execution, the current instruction is found by taking the `pc`th byte of `code` (or 0 if `pc >= len(code)`), and each instruction has its own definition in terms of how it affects the tuple.

在每一轮执行开始时，当前指令通过读取 `code` 的第 `pc` 个 byte 来确定（如果 `pc >= len(code)`，则取 0）；每条指令都有自己关于如何影响该元组的定义。

For example, `ADD` pops two items off the stack and pushes their sum, reduces `gas` by 1 and increments `pc` by 1, and `SSTORE` pops the top two items off the stack and inserts the second item into the contract’s storage at the index specified by the first item.

例如，`ADD` 会从 stack 顶部弹出两个元素并将它们的和压回 stack，同时将 `gas` 减少 1，并把 `pc` 加 1；而 `SSTORE` 会从 stack 顶部弹出两个元素，并将第二个元素插入到 contract 的 storage 中，索引由第一个元素指定。

Although there are many ways to optimize Ethereum virtual machine execution via just-in-time compilation, a basic implementation of Ethereum can be done in a few hundred lines of code.

尽管可以通过 just-in-time compilation 等方式对 Ethereum virtual machine 的执行进行大量优化，但一个基础版的 Ethereum 实现其实只需要几百行代码。

> **EVM 的简洁性**<br />
> EVM 的指令集只有约 140 个 opcode, 设计极简.
> 这种简洁性是刻意的: 越简单的系统越容易做形式化验证, 越不容易出 bug.
> 现实中有多种语言可编译为 EVM bytecode, 其中 Solidity 是最主流的.
> 白皮书中提到的 Serpent (Python 风格) 已基本被弃用.

### Blockchain and Mining

![Ethereum apply block diagram](https://ethereum.org/content/whitepaper/ethereum-apply-block-diagram.png)

The Ethereum blockchain is in many ways similar to the Bitcoin blockchain, although it does have some differences.

Ethereum blockchain 在很多方面与 Bitcoin blockchain 相似，但也确实存在一些差异。

The main difference between Ethereum and Bitcoin with regard to the blockchain architecture is that, unlike Bitcoin, Ethereum blocks contain a copy of both the transaction list and the most recent state.

就 blockchain 架构而言，Ethereum 与 Bitcoin 的主要区别在于：与 Bitcoin 不同，Ethereum blocks 同时包含 transaction list 和最新 state 的一份拷贝。

> **与 Bitcoin 的关键差异: 存储 state**<br />
> Bitcoin block 只记录交易列表, 要知道当前状态必须从创世块开始 replay 所有交易.
> Ethereum block 额外包含 state root (状态树的根 hash), 因此新加入的节点不必重放全部历史.
> 这使得 Ethereum 可以支持“state pruning”: 只保留最近的 state 即可验证新 block.

Aside from that, two other values, the block number and the difficulty, are also stored in the block.

除此之外，block number 和 difficulty 这两个值也会被存储在 block 中。

The basic block validation algorithm in Ethereum is as follows:

Ethereum 中基础的 block 验证算法如下：

1. Check if the previous block referenced exists and is valid.
   检查所引用的前一个 block 是否存在且有效。
2. Check that the timestamp of the block is greater than that of the referenced previous block and less than 15 minutes into the future
   检查该 block 的 timestamp 是否大于所引用前一个 block 的 timestamp，并且不超过未来 15 分钟。
3. Check that the block number, difficulty, transaction root, uncle root and gas limit (various low-level Ethereum-specific concepts) are valid.
   检查 block number、difficulty、transaction root、uncle root 和 gas limit（这些都是 Ethereum 特有的底层概念）是否有效。
4. Check that the proof-of-work on the block is valid.
   检查该 block 上的 proof-of-work 是否有效。
5. Let `S[0]` be the state at the end of the previous block.
   令 `S[0]` 为前一个 block 结束时的 state。
6. Let `TX` be the block’s transaction list, with `n` transactions.  For all `i` in `0...n-1`, set `S[i+1] = APPLY(S[i], TX[i])`.  If any applications returns an error, or if the total gas consumed in the block up until this point exceeds the `GASLIMIT`, return an error.
   令 `TX` 为该 block 的 transaction list，其中共有 `n` 笔 transactions。对于 `0...n-1` 中的所有 `i`，令 `S[i+1] = APPLY(S[i], TX[i])`。如果任何一次应用返回错误，或者到此为止该 block 累计消耗的 gas 总量超过了 `GASLIMIT`，则返回错误。
7. Let `S_FINAL` be `S[n]`, but adding the block reward paid to the miner.
   令 `S_FINAL` 为 `S[n]` 再加上支付给 miner 的 block reward 后得到的 state。
8. Check if the Merkle tree root of the state `S_FINAL` is equal to the final state root provided in the block header.  If it is, the block is valid; otherwise, it is not valid.
   检查 state `S_FINAL` 的 Merkle tree root 是否等于 block header 中给出的最终 state root。如果相等，则该 block 有效；否则无效。

The approach may seem highly inefficient at first glance, because it needs to store the entire state with each block, but in reality efficiency should be comparable to that of Bitcoin.

这种做法乍看之下似乎非常低效，因为它需要在每个 block 中存储整个 state；但实际上，其效率应当与 Bitcoin 相当。

The reason is that the state is stored in the tree structure, and after every block only a small part of the tree needs to be changed.

原因在于，state 是存储在树结构中的，而在每个 block 之后，通常只有树中的一小部分需要变化。

Thus, in general, between two adjacent blocks the vast majority of the tree should be the same, and therefore the data can be stored once and referenced twice using pointers (i.e., hashes of subtrees).

因此，一般来说，相邻两个 blocks 之间，树的绝大部分都应当是相同的，所以这些数据可以只存储一次，并通过指针（即子树的 hashes）被引用两次。

A special kind of tree known as a “Patricia tree” is used to accomplish this, including a modification to the Merkle tree concept that allows for nodes to be inserted and deleted, and not just changed, efficiently.

为实现这一点，系统使用了一种称为 “Patricia tree” 的特殊树结构，并对 Merkle tree 概念做了修改，使节点不仅能够被高效修改，还能被高效插入和删除。

> **Merkle Patricia Trie (MPT)**<br />
> 这是 Ethereum 最核心的数据结构之一, 结合了:
> (1) Patricia trie (前缀树): 实现高效的键值查找和前缀压缩.
> (2) Merkle tree: 任何数据的修改都会反映到根 hash 上, 保证可验证性.
> Ethereum 使用三棵 MPT: state trie (账户状态), storage trie (合约存储), transaction trie (区块交易).
> 每棵树的根 hash 都存储在 block header 中.

Additionally, because all of the state information is part of the last block, there is no need to store the entire blockchain history - a strategy which, if it could be applied to Bitcoin, can be calculated to provide 5-20x savings in space.

此外，由于所有 state 信息都属于最后一个 block 的一部分，因此没有必要存储完整的 blockchain 历史；如果这种策略可以应用到 Bitcoin 上，理论上可以带来 5-20 倍的空间节省。

A commonly asked question is “where” contract code is executed, in terms of physical hardware.

一个经常被问到的问题是：从物理硬件角度看，contract code 究竟是“在哪里”执行的？

This has a simple answer: the process of executing contract code is part of the definition of the state transition function, which is part of the block validation algorithm, so if a transaction is added into block `B` the code execution spawned by that transaction will be executed by all nodes, now and in the future, that download and validate block `B`.

答案很简单：执行 contract code 的过程，是状态转移函数定义的一部分，而状态转移函数又是 block 验证算法的一部分；因此，如果某笔 transaction 被加入到 block `B` 中，那么由该 transaction 触发的代码执行，都会被所有现在及未来下载并验证 block `B` 的节点执行。

> **“代码在哪里执行?”**<br />
> 答案是: 在 *每一个* 验证节点上都会执行一遍. 这就是去中心化的代价.
> 这也解释了为什么 gas 如此重要: 你写的每一行代码, 全世界成千上万台机器都要执行一次.
> 正因如此, blockchain 不适合做大规模计算或存储, 它更适合做“仲裁”和“共识”.

## Applications

In general, there are three types of applications on top of Ethereum.

总体而言，Ethereum 之上的应用可以分为三类。

The first category is financial applications, providing users with more powerful ways of managing and entering into contracts using their money.

第一类是金融应用，它为用户提供了更强大的资金管理与签订合约方式。

This includes sub-currencies, financial derivatives, hedging contracts, savings wallets, wills, and ultimately even some classes of full-scale employment contracts.

其中包括子货币、金融衍生品、对冲合约、储蓄钱包、遗嘱，乃至某些完整劳动合同类型。

The second category is semi-financial applications, where money is involved but there is also a heavy non-monetary side to what is being done; a perfect example is self-enforcing bounties for solutions to computational problems.

第二类是半金融应用，这类应用中虽然涉及金钱，但所做的事情也有很重的非货币属性；一个典型例子是对计算问题解答进行自执行赏金支付。

Finally, there are applications such as online voting and decentralized governance that are not financial at all.

最后，还有诸如在线投票和去中心化治理这类完全非金融性的应用。

> **Applications 章节导语**<br />
> 本章列举了 Ethereum 上可以构建的各类应用.
> 写于 2013 年的这些设想, 大部分在后来的 DeFi (去中心化金融) 和 Web3 浪潮中都变成了现实.
> 读者可以对照当今生态中的具体项目来理解每个例子.

### Token Systems

On-blockchain token systems have many applications ranging from sub-currencies representing assets such as USD or gold to company stocks, individual tokens representing smart property, secure unforgeable coupons, and even token systems with no ties to conventional value at all, used as point systems for incentivization.

链上 token systems 有着广泛用途，从表示 USD 或 gold 等资产的子货币，到公司股票、表示 smart property 的独立 token、不可伪造的安全优惠券，甚至完全不与传统价值挂钩、仅作为激励积分系统的 token systems。

Token systems are surprisingly easy to implement in Ethereum.

token systems 在 Ethereum 中实现起来出奇地简单。

The key point to understand is that all a currency, or token system, fundamentally is, is a database with one operation: subtract X units from A and give X units to B, with the proviso that (i) A had at least X units before the transaction and (2) the transaction is approved by A.

关键在于要理解：一种货币，或者说 token system，从根本上讲就是一个只有一种操作的数据库，即从 A 扣除 X 个单位并将 X 个单位给到 B，前提条件是：(i) A 在 transaction 发生前至少拥有 X 个单位；(2) 该 transaction 得到了 A 的批准。

All that it takes to implement a token system is to implement this logic into a contract.

要实现一个 token system，只需要把这套逻辑实现进某个 contract 中即可。

The basic code for implementing a token system in Serpent looks as follows:

用 Serpent 实现 token system 的基础代码如下：

```py
def send(to, value):
    if self.storage[msg.sender] >= value:
       self.storage[msg.sender] = self.storage[msg.sender] - value
       self.storage[to] = self.storage[to] + value
```

This is essentially a literal implementation of the “banking system” state transition function described further above in this document.

这本质上就是对本文前面描述的“banking system”状态转移函数的一种字面实现。

> **现实实现: ERC-20**<br />
> 白皮书中这段 Serpent 代码就是后来 ERC-20 token 标准的雏形.
> 2015 年, Fabian Vogelsteller 和 Vitalik Buterin 提出了 ERC-20, 标准化了 token 的接口 (transfer, balanceOf, approve 等).
> ERC-20 极大降低了发行新 token 的门槛, 催生了 2017 年的 ICO 热潮.
> 如今链上有数以万计的 ERC-20 tokens, 包括 USDT, USDC, LINK, UNI 等.

A few extra lines of code need to be added to provide for the initial step of distributing the currency units in the first place and a few other edge cases, and ideally a function would be added to let other contracts query for the balance of an address.

只需要再补上几行代码，用于一开始分发货币单位，以及处理一些边界情况；理想情况下，还会再加一个函数，让其他 contracts 可以查询某个地址的余额。

But that’s all there is to it.

不过，事情基本也就如此而已。

Theoretically, Ethereum-based token systems acting as sub-currencies can potentially include another important feature that onchain Bitcoin-based meta-currencies lack: the ability to pay transaction fees directly in that currency.

理论上，作为子货币运行的 Ethereum-based token systems 还可以包含另一个重要特性，而这是链上 Bitcoin-based meta-currencies 所缺乏的：直接用该货币支付 transaction fees 的能力。

The way this would be implemented is that the contract would maintain an ether balance with which it would refund ether used to pay fees to the sender, and it would refill this balance by collecting the internal currency units that it takes in fees and reselling them in a constant running auction.

实现方式是，contract 维护一个 ether balance，用来把用于支付 fees 的 ether 退还给发送者；而这个 balance 则通过收取内部货币单位作为费用，并在一个持续运行的拍卖中转售这些单位来补充。

Users would thus need to “activate” their accounts with ether, but once the ether is there it would be reusable because the contract would refund it each time.

因此，用户需要先用 ether“激活”自己的 accounts；但一旦放入 ether，由于 contract 每次都会退还，这些 ether 便可以重复使用。

### Financial derivatives and Stable-Value Currencies

Financial derivatives are the most common application of a “smart contract”, and one of the simplest to implement in code.

金融衍生品是 “smart contract” 最常见的应用之一，也是最容易用代码实现的应用之一。

The main challenge in implementing financial contracts is that the majority of them require reference to an external price ticker; for example, a very desirable application is a smart contract that hedges against the volatility of ether (or another cryptocurrency) with respect to the US dollar, but doing this requires the contract to know what the value of ETH/USD is.

实现金融合约的主要挑战在于，大多数合约都需要引用外部价格 ticker；例如，一个非常理想的应用是用 smart contract 来对冲 ether（或其他 cryptocurrency）相对于 US dollar 的波动，但要做到这一点，就要求 contract 知道 ETH/USD 的价格是多少。

> **oracle 问题 (预言机问题)**<br />
> blockchain 是一个封闭的确定性系统, 它 *无法* 主动获取链外数据 (e.g., 价格, 天气, 比赛结果).
> oracle 就是把链外数据“喂”进链上的桥梁.
> 但这里有一个信任问题: 如果 oracle 提供的数据是假的, smart contract 也会做出错误决策.
> 这被称为 “oracle problem”, 是 blockchain 应用的核心挑战之一.

> **现实实现: Chainlink**<br />
> Chainlink 是目前最广泛使用的去中心化 oracle 网络.
> 它汇聚多个独立数据源, 通过经济激励和声誉系统来保证数据质量.
> 几乎所有 DeFi 协议都依赖 Chainlink 或类似 oracle 来获取价格数据.

The simplest way to do this is through a “data feed” contract maintained by a specific party (e.g., NASDAQ) designed so that that party has the ability to update the contract as needed, and providing an interface that allows other contracts to send a message to that contract and get back a response that provides the price.

最简单的做法，是使用由特定一方（例如 NASDAQ）维护的 “data feed” contract，并将其设计为该方能够按需更新 contract，同时提供一个接口，让其他 contracts 可以向它发送 message，并得到包含价格的响应。

Given that critical ingredient, the hedging contract would look as follows:

有了这一关键组成部分后，对冲合约就会像下面这样运作：

1. Wait for party A to input 1000 ether.
   等待 A 方存入 1000 ether。
2. Wait for party B to input 1000 ether.
   等待 B 方存入 1000 ether。
3. Record the USD value of 1000 ether, calculated by querying the data feed contract, in storage, say this is $x.
   通过查询 data feed contract 计算出 1000 ether 的 USD 价值，并将其记录到 storage 中，假设该值为 $x。
4. After 30 days, allow A or B to “reactivate” the contract in order to send $x worth of ether (calculated by querying the data feed contract again to get the new price) to A and the rest to B.
   30 天后，允许 A 或 B “reactivate” 该 contract，以便将价值 $x 的 ether（通过再次查询 data feed contract 获得新价格后计算）发送给 A，剩余部分发送给 B。

Such a contract would have significant potential in crypto-commerce.

这样的 contract 在 crypto-commerce 中将具有重大潜力。

One of the main problems cited about cryptocurrency is the fact that it’s volatile; although many users and merchants may want the security and convenience of dealing with cryptographic assets, they many not wish to face that prospect of losing 23% of the value of their funds in a single day.

人们经常批评 cryptocurrency 的一个主要问题，就是它的波动性；尽管许多用户和商家希望享受使用加密资产的安全性和便利性，但他们未必愿意面对资金价值在一天内损失 23% 的风险。

Up until now, the most commonly proposed solution has been issuer-backed assets; the idea is that an issuer creates a sub-currency in which they have the right to issue and revoke units, and provide one unit of the currency to anyone who provides them (offline) with one unit of a specified underlying asset (e.g., gold, USD).

到目前为止，最常被提出的解决方案是 issuer-backed assets；其思路是，由发行方创建一种子货币，并拥有发行与撤销单位的权利，然后向任何在线下交付给他们某个指定底层资产（例如 gold、USD）一个单位的人，发放这种货币的一个单位。

The issuer then promises to provide one unit of the underlying asset to anyone who sends back one unit of the crypto-asset.

发行方随后承诺：任何人只要把一个单位的这种 crypto-asset 返还给他们，就能换回一个单位的底层资产。

This mechanism allows any non-cryptographic asset to be “uplifted” into a cryptographic asset, provided that the issuer can be trusted.

这种机制允许任何非加密资产在发行方可信的前提下被“提升”为一种加密资产。

In practice, however, issuers are not always trustworthy, and in some cases the banking infrastructure is too weak, or too hostile, for such services to exist.

然而在现实中，issuers 并不总是可信，而且在某些情况下，银行基础设施过于薄弱，或者过于敌对，以至于这类服务根本无法存在。

Financial derivatives provide an alternative.

金融衍生品提供了另一种选择。

Here, instead of a single issuer providing the funds to back up an asset, a decentralized market of speculators, betting that the price of a cryptographic reference asset (e.g., ETH) will go up, plays that role.

在这里，并不是由单一发行方提供支撑某个资产的资金，而是由一个去中心化的投机者市场来承担这一角色；这些人押注某个加密参考资产（例如 ETH）的价格会上涨。

Unlike issuers, speculators have no option to default on their side of the bargain because the hedging contract holds their funds in escrow.

与发行方不同，speculators 无法在自己这一方违约，因为对冲合约会以 escrow 形式托管他们的资金。

Note that this approach is not fully decentralized, because a trusted source is still needed to provide the price ticker, although arguably even still this is a massive improvement in terms of reducing infrastructure requirements (unlike being an issuer, issuing a price feed requires no licenses and can likely be categorized as free speech) and reducing the potential for fraud.

需要注意的是，这种方法并非完全去中心化，因为仍然需要一个可信来源来提供价格 ticker；但即便如此，它在降低基础设施要求（与担任发行方不同，提供价格 feed 不需要牌照，而且很可能可以被归类为言论自由）以及减少欺诈可能性方面，仍然是一项巨大的改进。

> **现实实现: 稳定币 (stablecoins)**<br />
> 白皮书中描述的对冲合约, 正是后来稳定币的核心思想.
> 主要类型:
> (1) 法币抵押型 (e.g., USDT, USDC): 由发行方持有等值法币储备, 最简单但需要信任.
> (2) 加密资产超额抵押型 (e.g., DAI/MakerDAO): 用 ETH 等抵押品生成稳定币, 对应白皮书中投机者充当对手方的模型.
> (3) 算法型 (e.g., 曾经的 UST): 依赖算法和套利来维持锚定, 风险最高 — 2022 年 Terra/Luna 崩盘即为前车之鉴.

### Identity and Reputation Systems

The earliest alternative cryptocurrency of all, [Namecoin](http://namecoin.org/), attempted to use a Bitcoin-like blockchain to provide a name registration system, where users can register their names in a public database alongside other data.

所有替代 cryptocurrency 中最早的一种，[Namecoin](http://namecoin.org/)，曾试图使用类似 Bitcoin 的 blockchain 来提供名称注册系统，使用户能够把自己的名字连同其他数据一起注册到公共数据库中。

The major cited use case is for a [DNS](https://wikipedia.org/wiki/Domain_Name_System) system, mapping domain names like “bitcoin.org” (or, in Namecoin’s case, “bitcoin.bit”) to an IP address.

最常被提及的用例，是作为一种 [DNS](https://wikipedia.org/wiki/Domain_Name_System) 系统，把类似 “bitcoin.org”（或在 Namecoin 中的 “bitcoin.bit”）这样的域名映射到某个 IP 地址。

Other use cases include email authentication and potentially more advanced reputation systems.

其他用例还包括 email 身份验证，以及可能更高级的信誉系统。

Here is the basic contract to provide a Namecoin-like name registration system on Ethereum:

下面是在 Ethereum 上提供 Namecoin-like 名称注册系统的基础 contract：

```py
def register(name, value):
    if !self.storage[name]:
        self.storage[name] = value
```

The contract is very simple; all it is a database inside the Ethereum network that can be added to, but not modified or removed from.

这个 contract 非常简单；它本质上只是 Ethereum 网络内部的一个数据库，可以向其中添加内容，但不能修改或删除已有内容。

Anyone can register a name with some value, and that registration then sticks forever.

任何人都可以用某个值注册一个名称，而这项注册将永久保留下来。

A more sophisticated name registration contract will also have a “function clause” allowing other contracts to query it, as well as a mechanism for the “owner” (i.e., the first registerer) of a name to change the data or transfer ownership.

更复杂的名称注册 contract 还会带有一个 “function clause”，允许其他 contracts 查询它，并提供一种机制，让某个名称的“owner”（也就是第一个注册者）能够修改数据或转移所有权。

One can even add reputation and web-of-trust functionality on top.

甚至还可以在其上叠加 reputation 与 web-of-trust 功能。

> **现实实现: ENS (Ethereum Name Service)**<br />
> 白皮书中描述的 Namecoin-like 名称注册系统, 后来在 Ethereum 上以 ENS 的形式实现.
> ENS 允许用户把类似 `vitalik.eth` 的可读名称映射到 Ethereum 地址.
> 与 Namecoin 不同, ENS 具有更丰富的功能: 支持子域名、反向解析、NFT 形式的域名所有权等.

### Decentralized File Storage

Over the past few years, there have emerged a number of popular online file storage startups, the most prominent being Dropbox, seeking to allow users to upload a backup of their hard drive and have the service store the backup and allow the user to access it in exchange for a monthly fee.

过去几年里，出现了许多流行的在线文件存储创业公司，其中最著名的是 Dropbox；它们试图让用户上传自己硬盘的备份，由服务商代为存储，并以月费形式向用户提供访问能力。

However, at this point the file storage market is at times relatively inefficient; a cursory look at various existing solutions shows that, particularly at the “uncanny valley” 20-200 GB level at which neither free quotas nor enterprise-level discounts kick in, monthly prices for mainstream file storage costs are such that you are paying for more than the cost of the entire hard drive in a single month.

然而，目前的文件存储市场有时相对低效；粗略看一眼各种现有方案就会发现，尤其是在 20-200 GB 这个既拿不到免费额度、也享受不到企业级折扣的“uncanny valley”区间，主流文件存储的月费高到你在一个月里付的钱就超过了整块硬盘本身的成本。

Ethereum contracts can allow for the development of a decentralized file storage ecosystem, where individual users can earn small quantities of money by renting out their own hard drives and unused space can be used to further drive down the costs of file storage.

Ethereum contracts 可以促成去中心化文件存储生态的发展，在这个生态中，个人用户可以通过出租自己的硬盘赚取少量收入，而那些闲置空间则可以被利用起来，进一步压低文件存储成本。

The key underpinning piece of such a device would be what we have termed the “decentralized Dropbox contract”.

这种装置的关键基础组件，是我们称之为 “decentralized Dropbox contract” 的东西。

This contract works as follows.

这个 contract 的运作方式如下。

First, one splits the desired data up into blocks, encrypting each block for privacy, and builds a Merkle tree out of it.

首先，把要存储的数据切分成多个 blocks，并为保护隐私对每个 block 加密，然后基于这些 blocks 构建一棵 Merkle tree。

One then makes a contract with the rule that, every N blocks, the contract would pick a random index in the Merkle tree (using the previous block hash, accessible from contract code, as a source of randomness), and give X ether to the first entity to supply a transaction with a simplified payment verification-like proof of ownership of the block at that particular index in the tree.

接着，创建一个 contract，并规定每隔 N 个 blocks，该 contract 就会在 Merkle tree 中随机选取一个索引（把 contract code 可访问的前一个 block hash 作为随机源），然后将 X ether 支付给第一个提交 transaction、并附带该索引位置 block 所有权的 simplified payment verification-like 证明的实体。

When a user wants to re-download their file, they can use a micropayment channel protocol (e.g., pay 1 szabo per 32 kilobytes) to recover the file; the most fee-efficient approach is for the payer not to publish the transaction until the end, instead replacing the transaction with a slightly more lucrative one with the same nonce after every 32 kilobytes.

当用户想重新下载自己的文件时，可以使用 micropayment channel protocol（例如每 32 kilobytes 支付 1 szabo）来取回文件；从费用效率角度看，最优做法是付款方在最后才发布 transaction，而是在每收到 32 kilobytes 后，用一笔使用相同 nonce、但略微更高收益的 transaction 去替换前一笔。

An important feature of the protocol is that, although it may seem like one is trusting many random nodes not to decide to forget the file, one can reduce that risk down to near-zero by splitting the file into many pieces via secret sharing, and watching the contracts to see each piece is still in some node’s possession.

这一协议的一个重要特征是，尽管看上去像是在信任许多随机节点不会决定忘掉这个文件，但实际上可以通过 secret sharing 把文件拆成许多片段，并持续观察 contracts，以确认每个片段仍在某个节点手中，从而把这种风险降到接近零。

If a contract is still paying out money, that provides a cryptographic proof that someone out there is still storing the file.

如果某个 contract 仍在持续支付报酬，那就为“仍有人在存储该文件”提供了密码学证明。

> **现实实现: IPFS / Filecoin / Arweave**<br />
> 白皮书中的“decentralized Dropbox”后来衍生出多个项目:
> IPFS: 去中心化的文件寻址和分发协议 (不含激励层).
> Filecoin: 在 IPFS 基础上增加了经济激励, 类似白皮书所述的付费存储模型.
> Arweave: 采用一次付费、永久存储的模式.
> 需要注意: 这些项目大多是独立的 blockchain 或协议, 而非直接运行在 Ethereum 上.

### Decentralized Autonomous Organizations

The general concept of a “decentralized autonomous organization” is that of a virtual entity that has a certain set of members or shareholders which, perhaps with a 67% majority, have the right to spend the entity’s funds and modify its code.

“decentralized autonomous organization” 的一般概念，是指一种虚拟实体，它拥有一组成员或股东；这些人可能只要达到 67% 多数，就有权支配该实体的资金并修改其代码。

The members would collectively decide on how the organization should allocate its funds.

成员将集体决定该组织应当如何分配自己的资金。

Methods for allocating a DAO’s funds could range from bounties, salaries to even more exotic mechanisms such as an internal currency to reward work.

DAO 的资金分配方式可以从赏金、薪资，一直到更奇特的机制，比如使用内部货币来奖励劳动。

This essentially replicates the legal trappings of a traditional company or nonprofit but using only cryptographic blockchain technology for enforcement.

这本质上复刻了传统公司或非营利组织的法律外壳，但只用密码学 blockchain 技术来实现执行。

> **The DAO 事件 (2016)**<br />
> 白皮书中对 DAO 的描述在 2016 年以一种戏剧性方式进入公众视野.
> “The DAO” 是第一个大型 DAO 项目, 通过众筹融资约 1.5 亿美元.
> 然而, 其 smart contract 存在 reentrancy (重入) 漏洞, 攻击者利用该漏洞盗走了约 360 万 ETH.
> 这导致了 Ethereum 社区的一次激烈争论, 最终以硬分叉回滚交易收场.
> 拒绝回滚的一方继续运行原链, 形成了 Ethereum Classic (ETC).
> 这一事件深刻塑造了此后 smart contract 安全审计的行业实践.

So far much of the talk around DAOs has been around the “capitalist” model of a “decentralized autonomous corporation” (DAC) with dividend-receiving shareholders and tradable shares; an alternative, perhaps described as a “decentralized autonomous community”, would have all members have an equal share in the decision making and require 67% of existing members to agree to add or remove a member.

到目前为止，围绕 DAOs 的很多讨论都集中在“资本主义”模型的 “decentralized autonomous corporation”（DAC）上，也就是拥有可交易股份和可分红股东的模式；另一种可称作 “decentralized autonomous community” 的替代方案，则让所有成员在决策中拥有平等份额，并要求现有成员中 67% 同意才能新增或移除某位成员。

The requirement that one person can only have one membership would then need to be enforced collectively by the group.

而“一人只能拥有一个成员资格”的要求，则需要由整个群体共同执行。

A general outline for how to code a DAO is as follows.

DAO 的编码方式大致可以概括如下。

The simplest design is simply a piece of self-modifying code that changes if two thirds of members agree on a change.

最简单的设计，就是一段可自我修改的代码：只要有三分之二的成员同意某项变更，它就会发生改变。

Although code is theoretically immutable, one can easily get around this and have de-facto mutability by having chunks of the code in separate contracts, and having the address of which contracts to call stored in the modifiable storage.

尽管理论上代码是不可变的，但只要把代码片段拆分到不同 contracts 中，并把应调用哪些 contracts 的地址存放在可修改的 storage 里，就可以很容易绕过这一点，从而实现事实上的可变性。

In a simple implementation of such a DAO contract, there would be three transaction types, distinguished by the data provided in the transaction:

在这类 DAO contract 的一个简单实现中，会有三种 transaction 类型，通过 transaction 中提供的数据加以区分：

- `[0,i,K,V]` to register a proposal with index `i` to change the address at storage index `K` to value `V`
  `[0,i,K,V]`，用于登记一个索引为 `i` 的提案，将 storage 索引 `K` 处的地址改为值 `V`。
- `[1,i]` to register a vote in favor of proposal `i`
  `[1,i]`，用于登记一票，表示支持提案 `i`。
- `[2,i]` to finalize proposal `i` if enough votes have been made
  `[2,i]`，用于在票数足够时最终确认提案 `i`。

The contract would then have clauses for each of these.

随后，contract 会为每一种类型提供相应的处理分支。

It would maintain a record of all open storage changes, along with a list of who voted for them.

它会维护所有尚未完成的 storage 变更记录，以及为这些变更投票的人名单。

It would also have a list of all members.

它还会保存全部成员列表。

When any storage change gets to two thirds of members voting for it, a finalizing transaction could execute the change.

当某项 storage 变更获得三分之二成员支持时，一笔最终确认的 transaction 就可以执行该变更。

A more sophisticated skeleton would also have built-in voting ability for features like sending a transaction, adding members and removing members, and may even provide for [Liquid Democracy](https://wikipedia.org/wiki/Liquid_democracy)-style vote delegation (i.e., anyone can assign someone to vote for them, and assignment is transitive so if A assigns B and B assigns C then C determines A’s vote).

更复杂的骨架还会内建投票能力，以支持发送 transaction、添加成员和移除成员等功能，甚至还可能支持 [Liquid Democracy](https://wikipedia.org/wiki/Liquid_democracy) 风格的投票委托（也就是说，任何人都可以指定他人代替自己投票，而且这种委托是可传递的，所以如果 A 委托给 B，B 又委托给 C，那么 C 就决定了 A 的投票）。

This design would allow the DAO to grow organically as a decentralized community, allowing people to eventually delegate the task of filtering out who is a member to specialists, although unlike in the “current system” specialists can easily pop in and out of existence over time as individual community members change their alignments.

这种设计将使 DAO 能够像一个去中心化社区那样有机生长，允许人们最终把“筛选谁是成员”的任务委托给专门人士；不过，与“现行系统”不同的是，随着社区成员立场的变化，这些专门人士也可以很容易地随时间出现或退出。

> **Liquid Democracy (流动民主)**<br />
> 介于直接民主和代议民主之间的一种模式.
> 你可以自己投票, 也可以把票委托给你信任的人; 而且你随时可以收回委托.
> 委托还可以传递: A→B→C, 那么 C 代表了 A 和 B 两人的票.
> 这在链上天然易于实现, 因为投票和委托都可以是 transparent 且 auditable 的 transactions.

An alternative model is for a decentralized corporation, where any account can have zero or more shares, and two thirds of the shares are required to make a decision.

另一种模型是 decentralized corporation，在这种模型中，任何 account 都可以拥有零股或多股，而做出决策需要三分之二的股份同意。

A complete skeleton would involve asset management functionality, the ability to make an offer to buy or sell shares, and the ability to accept offers (preferably with an order-matching mechanism inside the contract).

一个完整的骨架需要包含资产管理功能、提出买卖股份要约的能力，以及接受要约的能力（最好在 contract 内部带有撮合机制）。

Delegation would also exist Liquid Democracy-style, generalizing the concept of a “board of directors”.

委托机制同样可以采用 Liquid Democracy 风格，从而推广“board of directors”的概念。

### Further Applications

#### Savings wallets

Suppose that Alice wants to keep her funds safe, but is worried that she will lose or someone will hack her private key.  She puts ether into a contract with Bob, a bank, as follows:

假设 Alice 想确保自己的资金安全，但担心自己会丢失私钥，或者私钥会被他人盗取。她把 ether 存入一个与银行 Bob 共同控制的 contract，规则如下：

- Alice alone can withdraw a maximum of 1% of the funds per day.
  Alice 单独每天最多可以提取 1% 的资金。
- Bob alone can withdraw a maximum of 1% of the funds per day, but Alice has the ability to make a transaction with her key shutting off this ability.
  Bob 单独每天最多也可以提取 1% 的资金，但 Alice 可以用自己的密钥发起一笔 transaction 来关闭 Bob 的这一权限。
- Alice and Bob together can withdraw anything.
  Alice 和 Bob 一起则可以提取任意金额。

Normally, 1% per day is enough for Alice, and if Alice wants to withdraw more she can contact Bob for help.

通常来说，每天 1% 对 Alice 已经足够；如果她想提取更多，就可以联系 Bob 协助。

If Alice’s key gets hacked, she runs to Bob to move the funds to a new contract.

如果 Alice 的密钥被盗，她就赶紧联系 Bob，把资金转移到一个新的 contract 中。

If she loses her key, Bob will get the funds out eventually.

如果她丢失了自己的密钥，Bob 最终也可以把资金取出来。

If Bob turns out to be malicious, then she can turn off his ability to withdraw.

如果 Bob 变成恶意方，那么她可以关闭 Bob 的提款能力。

> **savings wallet 的现实意义**<br />
> 这个例子展示了 smart contract 相比 multisig 的灵活性: 不同的密钥可以有不同的权限和额度限制.
> 在现实中, 类似的设计被称为 “social recovery wallet”, 代表项目如 Argent.
> Vitalik 本人也多次倡导这种钱包设计, 认为它比传统的单一私钥模型更安全实用.

#### Crop insurance

One can easily make a financial derivatives contract but using a data feed of the weather instead of any price index.

人们可以很容易地构建一种金融衍生品合约，只不过它使用的不是价格指数，而是天气 data feed。

If a farmer in Iowa purchases a derivative that pays out inversely based on the precipitation in Iowa, then if there is a drought, the farmer will automatically receive money and if there is enough rain the farmer will be happy because their crops would do well.

如果 Iowa 的一位农民购买了一种根据当地降水量反向赔付的衍生品，那么当发生干旱时，这位农民就会自动获得赔付；而如果雨水充足，农民也会高兴，因为作物会长得很好。

This can be expanded to natural disaster insurance generally.

这一思路还可以进一步推广到一般性的自然灾害保险。

#### A decentralized data feed

For financial contracts for difference, it may actually be possible to decentralize the data feed via a protocol called “[SchellingCoin](https://blog.ethereum.org/2014/03/28/schellingcoin-a-minimal-trust-universal-data-feed)”.

对于金融差价合约而言，实际上可能可以通过一种名为 “[SchellingCoin](https://blog.ethereum.org/2014/03/28/schellingcoin-a-minimal-trust-universal-data-feed)” 的协议来实现 data feed 的去中心化。

SchellingCoin basically works as follows: N parties all put into the system the value of a given datum (e.g., the ETH/USD price), the values are sorted, and everyone between the 25th and 75th percentile gets one token as a reward.

SchellingCoin 的基本工作方式如下：N 个参与方都向系统提交某个给定数据的数值（例如 ETH/USD 价格），这些数值会被排序，而落在第 25 百分位到第 75 百分位之间的每个人都会获得一个 token 作为奖励。

Everyone has the incentive to provide the answer that everyone else will provide, and the only value that a large number of players can realistically agree on is the obvious default: the truth.

每个人都有动机给出他们认为其他人也会给出的答案，而大量参与者唯一现实中能共同达成一致的数值，就是那个显而易见的默认答案：真相。

> **Schelling point (谢林点)**<br />
> SchellingCoin 的名字来源于博弈论中的 “Schelling focal point” 概念.
> 当人们无法沟通但需要协调时, 会不约而同地选择最“显然”的答案.
> 例如: “在纽约随机约见面, 你会去哪?” — 大多数人会选中央车站的大钟下方.
> SchellingCoin 利用这一点: 诚实报告真实数据就是大多数人自然会做的事.

This creates a decentralized protocol that can theoretically provide any number of values, including the ETH/USD price, the temperature in Berlin or even the result of a particular hard computation.

这创造出一种去中心化协议，理论上可以提供任意数量的数值，包括 ETH/USD 价格、Berlin 的温度，甚至某个特定困难计算的结果。

#### Smart multisignature escrow

Bitcoin allows multisignature transaction contracts where, for example, three out of a given five keys can spend the funds.

Bitcoin 允许 multisignature transaction contracts，例如给定五把密钥中只要有三把签名就能花费资金。

Ethereum allows for more granularity; for example, four out of five can spend everything, three out of five can spend up to 10% per day, and two out of five can spend up to 0.5% per day.

Ethereum 则允许更细粒度的控制；例如，五把密钥中的四把可以花费全部资金，三把可以每天最多花费 10%，两把可以每天最多花费 0.5%。

> **与 Bitcoin multisig 的对比**<br />
> Bitcoin 的 multisig 只能做简单的 M-of-N (N 把钥匙中的 M 把即可), 且是同步的 (所有签名必须在同一笔交易中).
> Ethereum 的 smart contract 可以实现任意组合的权限规则: 不同数量的签名对应不同额度, 还可以设置时间锁等.
> 这是 Ethereum 可编程性的一个直观体现.

Additionally, Ethereum multisig is asynchronous - two parties can register their signatures on the blockchain at different times and the last signature will automatically send the transaction.

此外，Ethereum multisig 是异步的，两方可以在不同时间把自己的签名登记到 blockchain 上，而最后一个签名会自动触发 transaction 的发送。

#### Cloud computing

The EVM technology can also be used to create a verifiable computing environment, allowing users to ask others to carry out computations and then optionally ask for proofs that computations at certain randomly selected checkpoints were done correctly.

EVM 技术还可以用于创建一个可验证的计算环境，使用户能够请他人代为执行计算，并可选地要求对方提供证明，说明在某些随机抽取的检查点上，计算确实被正确完成。

This allows for the creation of a cloud computing market where any user can participate with their desktop, laptop or specialized server, and spot-checking together with security deposits can be used to ensure that the system is trustworthy (i.e., nodes cannot profitably cheat).

这使得一个 cloud computing 市场成为可能：任何用户都可以用自己的 desktop、laptop 或专用服务器参与其中，而抽查机制与 security deposits 则可用于确保系统值得信赖（也就是说，节点无法通过作弊获利）。

Although such a system may not be suitable for all tasks; tasks that require a high level of inter-process communication, for example, cannot easily be done on a large cloud of nodes.

不过，这样的系统未必适合所有任务；例如，需要高强度进程间通信的任务，就很难在大规模节点云上轻松完成。

Other tasks, however, are much easier to parallelize; projects like SETI@home, folding@home and genetic algorithms can easily be implemented on top of such a platform.

但另一些任务则更容易并行化；像 SETI@home、folding@home 和 genetic algorithms 这样的项目，就可以很容易地在这种平台之上实现。

#### Peer-to-peer gambling

Any number of peer-to-peer gambling protocols, such as Frank Stajano and Richard Clayton’s [Cyberdice](http://www.cl.cam.ac.uk/~fms27/papers/2008-StajanoCla-cyberdice.pdf), can be implemented on the Ethereum blockchain.

许多 peer-to-peer gambling 协议都可以在 Ethereum blockchain 上实现，例如 Frank Stajano 和 Richard Clayton 的 [Cyberdice](http://www.cl.cam.ac.uk/~fms27/papers/2008-StajanoCla-cyberdice.pdf)。

The simplest gambling protocol is actually simply a contract for difference on the next block hash, and more advanced protocols can be built up from there, creating gambling services with near-zero fees that have no ability to cheat.

最简单的赌博协议实际上只是在下一个 block hash 之上建立的一个差价合约，而更高级的协议可以在此基础上逐步构建，从而形成几乎零手续费且无法作弊的赌博服务。

#### Prediction markets

Provided an oracle or SchellingCoin, prediction markets are also easy to implement, and prediction markets together with SchellingCoin may prove to be the first mainstream application of [futarchy](https://mason.gmu.edu/~rhanson/futarchy.html) as a governance protocol for decentralized organizations.

只要有 oracle 或 SchellingCoin，prediction markets 也很容易实现；而 prediction markets 与 SchellingCoin 结合起来，可能会成为 [futarchy](https://mason.gmu.edu/~rhanson/futarchy.html) 作为去中心化组织治理协议的首个主流应用。

> **现实实现: 预测市场**<br />
> Augur (2018) 是 Ethereum 上最早一批、也最知名的去中心化预测市场之一, 但因用户体验复杂而未获广泛采用.
> Polymarket (基于 Polygon) 在 2024 年美国大选期间引起广泛关注, 成为最知名的链上预测市场.
> **futarchy**: 经济学家 Robin Hanson 提出的治理模型 — “用预测市场来选择政策, 用投票来定义目标”.

#### Onchain decentralized marketplaces

Using the identity and reputation system as a base.

以 identity 和 reputation system 为基础来实现。

## Miscellanea And Concerns

### Modified GHOST Implementation

The “Greedy Heaviest Observed Subtree” (GHOST) protocol is an innovation first introduced by Yonatan Sompolinsky and Aviv Zohar in [December 2013](https://eprint.iacr.org/2013/881.pdf).

“Greedy Heaviest Observed Subtree”（GHOST）协议，是 Yonatan Sompolinsky 和 Aviv Zohar 在 [2013 年 12 月](https://eprint.iacr.org/2013/881.pdf) 首次提出的一项创新。

> **GHOST 章节导语**<br />
> GHOST 是 Ethereum 与 Bitcoin 在共识层面的一个重要差异.
> Bitcoin 的 10 分钟出块间隔可以容忍网络延迟, 但 Ethereum 想要更快的出块 (约 12-15 秒).
> 出块越快, 同时出现多个有效 block 的概率越高, 造成大量“废块”.
> GHOST 协议的目标就是解决这个问题: 让废块也能为网络安全做贡献.

The motivation behind GHOST is that blockchains with fast confirmation times currently suffer from reduced security due to a high stale rate - because blocks take a certain time to propagate through the network, if miner A mines a block and then miner B happens to mine another block before miner A’s block propagates to B, miner B’s block will end up wasted and will not contribute to network security.

GHOST 的动机在于，确认时间较快的 blockchains 目前会因 stale rate 较高而遭受安全性下降的问题。因为 blocks 在网络中传播需要一定时间，如果 miner A 挖出一个 block，而在 A 的 block 传播到 B 之前 miner B 恰好又挖出另一个 block，那么 B 的 block 最终就会被浪费，无法为网络安全作出贡献。

Furthermore, there is a centralization issue: if miner A is a mining pool with 30% hashpower and B has 10% hashpower, A will have a risk of producing a stale block 70% of the time (since the other 30% of the time A produced the last block and so will get mining data immediately) whereas B will have a risk of producing a stale block 90% of the time.

此外，这里还存在中心化问题：如果 miner A 是一个拥有 30% hashpower 的 mining pool，而 B 只有 10% hashpower，那么 A 产生 stale block 的风险有 70%（因为另外 30% 的时候上一个 block 本来就是 A 挖出的，所以它能立即获得挖矿数据），而 B 产生 stale block 的风险则高达 90%。

Thus, if the block interval is short enough for the stale rate to be high, A will be substantially more efficient simply by virtue of its size.

因此，如果 block interval 足够短，以至于 stale rate 很高，那么 A 仅仅凭借规模优势就会显著更高效。

With these two effects combined, blockchains which produce blocks quickly are very likely to lead to one mining pool having a large enough percentage of the network hashpower to have de facto control over the mining process.

这两个效应叠加后，快速出块的 blockchains 很可能会导致某一个 mining pool 掌握足够高比例的网络 hashpower，从而事实上控制整个 mining 过程。

As described by Sompolinsky and Zohar, GHOST solves the first issue of network security loss by including stale blocks in the calculation of which chain is the “longest”; that is to say, not just the parent and further ancestors of a block, but also the stale descendants of the block’s ancestor (in Ethereum jargon, “uncles”) are added to the calculation of which block has the largest total proof-of-work backing it.

按照 Sompolinsky 和 Zohar 的描述，GHOST 通过把 stale blocks 纳入“哪条链是最长链”的计算，来解决网络安全损失的第一个问题；也就是说，不仅一个 block 的父块及更早祖先会被计算在内，该 block 祖先的 stale descendants（在 Ethereum 术语中称为 “uncles”）也会被纳入“哪个 block 获得最多总 proof-of-work 支持”的计算中。

> **uncle block (叔块)**<br />
> 当两个 miner 几乎同时挖出有效 block 时, 往往只有一个会进入主链, 另一个会变成 stale block.
> 在 Bitcoin 中, 类似的 stale block 没有直接奖励, 也不会被计入主链.
> 在 Ethereum PoW 中, 若该 stale block 满足条件并被后续主链 block 引用, 它才会成为 uncle/ommer 并获得部分奖励.
> 不过在主网实际实现里, ommer 的奖励机制被采纳了, 但链选择仍主要看 canonical chain 的 total difficulty, 而不是把 ommer 直接计入链权重.
> 这鼓励小矿工继续参与, 减缓了大矿池的中心化优势.

> **历史与当前差异**<br />
> uncle block 机制是 PoW 时代的产物.
> 2022 年 The Merge 后, Ethereum 切换到 PoS, 不再有 mining, 也不再有 uncle blocks.
> PoS 下每个 slot 只指定一个 proposer; 正常情况下不会再出现 PoW 式的 uncle/ommer 奖励机制.
> 但网络延迟或 proposer equivocation 仍可能造成临时分叉, 只是处理方式已经改由 PoS 的 fork-choice 与 slashing 规则约束.

To solve the second issue of centralization bias, we go beyond the protocol described by Sompolinsky and Zohar, and also provide block rewards to stales: a stale block receives 87.5% of its base reward, and the nephew that includes the stale block receives the remaining 12.5%.

为了解决第二个中心化偏置问题，我们在 Sompolinsky 和 Zohar 描述的协议基础上更进一步，也向 stale blocks 提供 block rewards：一个 stale block 获得其基础奖励的 87.5%，而包含该 stale block 的 nephew 则获得剩余的 12.5%。

Transaction fees, however, are not awarded to uncles.

不过，transaction fees 不会奖励给 uncles。

Ethereum implements a simplified version of GHOST which only goes down seven levels.

Ethereum 实现的是一个简化版 GHOST，它只向下追溯七层。

Specifically, it is defined as follows:

具体定义如下：

- A block must specify a parent, and it must specify 0 or more uncles
  一个 block 必须指定一个 parent，并且必须指定 0 个或更多 uncles。
- An uncle included in block B must have the following properties:
  被纳入 block B 的 uncle 必须满足以下性质：
  - It must be a direct child of the kth generation ancestor of B, where `2 <= k <= 7`.
    它必须是 B 的第 k 代祖先的直接子块，其中 `2 <= k <= 7`。
  - It cannot be an ancestor of B
    它不能是 B 的祖先。
  - An uncle must be a valid block header, but does not need to be a previously verified or even valid block
    一个 uncle 必须是有效的 block header，但不必是一个此前已经被验证过的、甚至不必是完整有效的 block。
  - An uncle must be different from all uncles included in previous blocks and all other uncles included in the same block (non-double-inclusion)
    一个 uncle 必须不同于之前 blocks 中包含的所有 uncles，也不同于同一个 block 中包含的其他 uncles（即不得重复包含）。
- For every uncle U in block B, the miner of B gets an additional 3.125% added to its coinbase reward and the miner of U gets 93.75% of a standard coinbase reward.
  对于 block B 中的每个 uncle U，B 的 miner 会在其 coinbase reward 基础上额外获得 3.125%，而 U 的 miner 会获得标准 coinbase reward 的 93.75%。

This limited version of GHOST, with uncles includable only up to 7 generations, was used for two reasons.

这一受限版本的 GHOST 只允许包含最多 7 代内的 uncles，采用它有两个原因。

First, unlimited GHOST would include too many complications into the calculation of which uncles for a given block are valid.

第一，无限制的 GHOST 会让“给定某个 block 时，哪些 uncles 有效”的计算变得过于复杂。

Second, unlimited GHOST with compensation as used in Ethereum removes the incentive for a miner to mine on the main chain and not the chain of a public attacker.

第二，像 Ethereum 这样给出补偿的无限制 GHOST，会削弱 miner 在主链上挖矿、而不是在公开攻击者链上挖矿的激励。

### Fees

Because every transaction published into the blockchain imposes on the network the cost of needing to download and verify it, there is a need for some regulatory mechanism, typically involving transaction fees, to prevent abuse.

由于每一笔发布到 blockchain 中的 transaction 都会给网络带来下载和验证它的成本，因此需要某种监管机制，通常就是 transaction fees，来防止滥用。

The default approach, used in Bitcoin, is to have purely voluntary fees, relying on miners to act as the gatekeepers and set dynamic minimums.

Bitcoin 所采用的默认方式，是完全自愿的 fees 模型：依赖 miners 充当守门人，并动态设定最低费用。

This approach has been received very favorably in the Bitcoin community particularly because it is “market-based”, allowing supply and demand between miners and transaction senders determine the price.

这一做法在 Bitcoin 社区中得到了非常积极的评价，尤其是因为它是“market-based”的，允许 miners 与 transaction senders 之间的供需关系决定价格。

The problem with this line of reasoning is, however, that transaction processing is not a market; although it is intuitively attractive to construe transaction processing as a service that the miner is offering to the sender, in reality every transaction that a miner includes will need to be processed by every node in the network, so the vast majority of the cost of transaction processing is borne by third parties and not the miner that is making the decision of whether or not to include it.

然而，这种推理的问题在于，transaction processing 并不是一个真正的市场；虽然把 transaction processing 理解为 miner 向 sender 提供的一种服务在直觉上很有吸引力，但现实中，miner 所包含的每一笔 transaction 都需要由网络中的每一个节点处理，因此 transaction processing 的绝大多数成本是由第三方承担的，而不是由决定是否纳入该 transaction 的 miner 承担。

Hence, tragedy-of-the-commons problems are very likely to occur.

因此，公地悲剧问题极有可能发生。

> **tragedy of the commons (公地悲剧)**<br />
> 经典经济学概念: 当资源是共享的而成本由个体承担时, 每个人都有过度使用的动机.
> 此处的“公地”是网络的计算和带宽资源.
> miner 纳入一笔交易只考虑自己的收益 (fee), 却不考虑全网其他节点的验证成本.
> 解决方案就是下文的 gas limit 机制: 用协议层面的硬限制来防止单个 block 消耗过多资源.

However, as it turns out this flaw in the market-based mechanism, when given a particular inaccurate simplifying assumption, magically cancels itself out.

然而，有趣的是，只要引入一个特定但并不准确的简化假设，这种 market-based 机制中的缺陷会“神奇地”自行抵消。

The argument is as follows.

论证如下。

Suppose that:

假设：

1. A transaction leads to `k` operations, offering the reward `kR` to any miner that includes it where `R` is set by the sender and `k` and `R` are (roughly) visible to the miner beforehand.
   某笔 transaction 会导致 `k` 次操作，并向任何将其纳入区块的 miner 提供 `kR` 的奖励，其中 `R` 由 sender 设定，而 `k` 与 `R` 在事前对 miner 大致可见。
2. An operation has a processing cost of `C` to any node (i.e., all nodes have equal efficiency)
   任意节点处理一次操作的成本都是 `C`（也即所有节点效率相同）。
3. There are `N` mining nodes, each with exactly equal processing power (i.e., `1/N` of total)
   存在 `N` 个 mining nodes，每个节点的算力完全相等（即各占总算力的 `1/N`）。
4. No non-mining full nodes exist.
   不存在非挖矿的 full nodes。

A miner would be willing to process a transaction if the expected reward is greater than the cost.

如果预期收益大于成本，miner 就愿意处理该 transaction。

Thus, the expected reward is `kR/N` since the miner has a `1/N` chance of processing the next block, and the processing cost for the miner is simply `kC`.

因此，预期收益是 `kR/N`，因为该 miner 有 `1/N` 的概率处理下一个 block，而对 miner 来说，处理成本就是 `kC`。

Hence, miners will include transactions where `kR/N > kC`, or `R > NC`.

因此，miners 会包含满足 `kR/N > kC` 的 transactions，也就是 `R > NC`。

Note that `R` is the per-operation fee provided by the sender, and is thus a lower bound on the benefit that the sender derives from the transaction, and `NC` is the cost to the entire network together of processing an operation.

注意，`R` 是 sender 为每次操作提供的费用，因此它也是 sender 从这笔 transaction 中获得收益的下界；而 `NC` 则是整个网络共同处理一次操作所需承担的成本。

Hence, miners have the incentive to include only those transactions for which the total utilitarian benefit exceeds the cost.

因此，miners 有动机只纳入那些总体效用收益超过成本的 transactions。

However, there are several important deviations from those assumptions in reality:

然而，在现实中，上述假设存在若干重要偏离：

1. The miner does pay a higher cost to process the transaction than the other verifying nodes, since the extra verification time delays block propagation and thus increases the chance the block will become a stale.
   miner 处理 transaction 的成本确实高于其他验证节点，因为额外的验证时间会延迟 block 传播，从而增加该 block 变成 stale 的概率。
2. There do exist nonmining full nodes.
   确实存在不参与挖矿的 full nodes。
3. The mining power distribution may end up radically inegalitarian in practice.
   在实践中，挖矿算力分布可能会变得极度不平等。
4. Speculators, political enemies and crazies whose utility function includes causing harm to the network do exist, and they can cleverly set up contracts where their cost is much lower than the cost paid by other verifying nodes.
   确实存在投机者、政治敌人以及那些把“损害网络”纳入自身效用函数的疯子，而他们可以巧妙设置 contracts，使自己的成本远低于其他验证节点所承担的成本。

(1) provides a tendency for the miner to include fewer transactions, and
(2) increases `NC`; hence, these two effects at least partially
cancel each other
out.<sup>[How?](https://web.archive.org/web/20250427212319/https://github.com/ethereum/wiki/issues/447#issuecomment-316972260#issuecomment-316972260)</sup>

(1) 会让 miner 倾向于纳入更少的 transactions，而
(2) 会提高 `NC`；因此，这两种效应至少会在一定程度上
相互抵消。<sup>[How?](https://web.archive.org/web/20250427212319/https://github.com/ethereum/wiki/issues/447#issuecomment-316972260#issuecomment-316972260)</sup>

(3) and (4) are the major issue; to solve them we simply institute a
floating cap: no block can have more operations than
`BLK_LIMIT_FACTOR` times the long-term exponential moving average.
Specifically:

(3) 和 (4) 才是主要问题；为了解决它们，我们直接引入一个
浮动上限：任何 block 的操作数都不能超过
长期指数移动平均值的 `BLK_LIMIT_FACTOR` 倍。
具体来说：

```js
blk.oplimit = floor(
    (
        blk.parent.oplimit * (EMAFACTOR - 1)
        + floor(parent.opcount * BLK_LIMIT_FACTOR)
    ) / EMA_FACTOR
)
```

`BLK_LIMIT_FACTOR` and `EMA_FACTOR` are constants that will be set to 65536 and 1.5 for the time being, but will likely be changed after further analysis.

`BLK_LIMIT_FACTOR` 和 `EMA_FACTOR` 是两个常量，暂时会被设定为 65536 和 1.5，但在进一步分析之后很可能还会调整。

There is another factor disincentivizing large block sizes in Bitcoin: blocks that are large will take longer to propagate, and thus have a higher probability of becoming stales.

Bitcoin 中还有另一个抑制大 block size 的因素：大的 blocks 传播更慢，因此变成 stale 的概率也更高。

In Ethereum, highly gas-consuming blocks can also take longer to propagate both because they are physically larger and because they take longer to process the transaction state transitions to validate.

在 Ethereum 中，消耗大量 gas 的 blocks 也会传播更慢，一方面因为它们在物理上更大，另一方面因为验证 transaction 状态转移需要更长的处理时间。

This delay disincentive is a significant consideration in Bitcoin, but less so in Ethereum because of the GHOST protocol; hence, relying on regulated block limits provides a more stable baseline.

这种延迟带来的激励约束在 Bitcoin 中是一个重要考量，但在 Ethereum 中由于 GHOST protocol 的存在，其重要性有所下降；因此，依赖受监管的 block 限额会提供一个更稳定的基线。

> **Fees 章节总结**<br />
> 这一章的核心论证: 纯市场化的 fee 机制不完美, 但通过浮动 gas limit 等监管手段可以补救.
> 实际演化: 2021 年 EIP-1559 引入了 base fee + priority fee 的双层模型.
> base fee 由协议根据上一个 block 的 gas 使用率自动调节, 且被直接销毁 (burn) 而非支付给矿工.
> 这让用户的 gas 估算变得更可预测, 也使 ETH 在高活跃期可能出现净通缩.

### Computation And Turing-Completeness

An important note is that the Ethereum virtual machine is Turing-complete; this means that EVM code can encode any computation that can be conceivably carried out, including infinite loops.

一个重要说明是，Ethereum virtual machine 是 Turing-complete 的；这意味着 EVM code 可以编码任何理论上可执行的计算，包括无限循环。

EVM code allows looping in two ways.

EVM code 允许通过两种方式进行循环。

First, there is a `JUMP` instruction that allows the program to jump back to a previous spot in the code, and a `JUMPI` instruction to do conditional jumping, allowing for statements like `while x < 27: x = x * 2`.

第一，存在 `JUMP` 指令，允许程序跳回代码中的先前位置；还存在 `JUMPI` 指令用于条件跳转，从而支持类似 `while x < 27: x = x * 2` 这样的语句。

Second, contracts can call other contracts, potentially allowing for looping through recursion.

第二，contracts 可以调用其他 contracts，这可能允许通过递归来形成循环。

This naturally leads to a problem: can malicious users essentially shut miners and full nodes down by forcing them to enter into an infinite loop? The issue arises because of a problem in computer science known as the halting problem: there is no way to tell, in the general case, whether or not a given program will ever halt.

这自然引出了一个问题：恶意用户是否可以通过迫使 miners 和 full nodes 进入无限循环，从而实质上让它们停摆？这个问题之所以存在，是因为计算机科学中有一个著名难题，叫做 halting problem：在一般情况下，没有办法判断某个给定程序最终是否会停止。

As described in the state transition section, our solution works by requiring a transaction to set a maximum number of computational steps that it is allowed to take, and if execution takes longer computation is reverted but fees are still paid.

正如状态转移章节中所述，我们的解决方案是要求 transaction 设定其允许使用的最大计算步数；如果执行时间超过该上限，那么计算会被回滚，但 fees 仍然需要支付。

Messages work in the same way.

messages 的工作方式也是一样的。

To show the motivation behind our solution, consider the following examples:

为了说明这一解决方案背后的动机，请看以下例子：

- An attacker creates a contract which runs an infinite loop, and then sends a transaction activating that loop to the miner.  The miner will process the transaction, running the infinite loop, and wait for it to run out of gas.  Even though the execution runs out of gas and stops halfway through, the transaction is still valid and the miner still claims the fee from the attacker for each computational step.
  攻击者创建一个会运行无限循环的 contract，然后向 miner 发送一笔激活该循环的 transaction。miner 会处理这笔 transaction，运行这个无限循环，并等待其耗尽 gas。即使执行因为 gas 用尽而在中途停止，这笔 transaction 依然有效，miner 仍然可以就每一个计算步骤向攻击者收取费用。
- An attacker creates a very long infinite loop with the intent of forcing the miner to keep computing for such a long time that by the time computation finishes a few more blocks will have come out and it will not be possible for the miner to include the transaction to claim the fee.  However, the attacker will be required to submit a value for `STARTGAS` limiting the number of computational steps that execution can take, so the miner will know ahead of time that the computation will take an excessively large number of steps.
  攻击者构造一个非常长的无限循环，意图迫使 miner 持续计算到这样一种程度：等计算结束时，链上已经多出了好几个 blocks，miner 也就来不及把该 transaction 纳入区块以领取费用。然而，攻击者必须提交一个 `STARTGAS` 值，限制执行最多可进行多少计算步骤，因此 miner 事先就能知道这次计算会耗费异常巨大的步数。
- An attacker sees a contract with code of some form like `send(A,contract.storage[A]); contract.storage[A] = 0`, and sends a transaction with just enough gas to run the first step but not the second (i.e., making a withdrawal but not letting the balance go down).  The contract author does not need to worry about protecting against such attacks, because if execution stops halfway through the changes get reverted.
  攻击者看到一个代码形如 `send(A,contract.storage[A]); contract.storage[A] = 0` 的 contract，于是发送一笔 gas 恰好只够执行第一步而不够执行第二步的 transaction（也就是成功提现，但不让余额减少）。contract 作者无需担心这种攻击，因为如果执行在中途停止，那么所有更改都会被回滚。
- A financial contract works by taking the median of nine proprietary data feeds in order to minimize risk.  An attacker takes over one of the data feeds, which is designed to be modifiable via the variable-address-call mechanism described in the section on DAOs, and converts it to run an infinite loop, thereby attempting to force any attempts to claim funds from the financial contract to run out of gas.  However, the financial contract can set a gas limit on the message to prevent this problem.
  某个金融 contract 通过取九个专有 data feeds 的中位数来降低风险。攻击者接管了其中一个 data feed，而这个 feed 又被设计成可通过 DAO 章节中描述的 variable-address-call 机制进行修改，于是攻击者将其改成运行无限循环，试图让任何从该金融 contract 提取资金的尝试都耗尽 gas。然而，金融 contract 可以对 message 设置 gas limit，从而防止这一问题。

The alternative to Turing-completeness is Turing-incompleteness, where `JUMP` and `JUMPI` do not exist and only one copy of each contract is allowed to exist in the call stack at any given time.

与 Turing-completeness 相对应的替代方案，是 Turing-incompleteness，即不存在 `JUMP` 和 `JUMPI`，并且在任意时刻的调用栈中，每个 contract 只允许存在一份副本。

With this system, the fee system described and the uncertainties around the effectiveness of our solution might not be necessary, as the cost of executing a contract would be bounded above by its size.

在这种系统下，上述 fee system 以及我们解决方案有效性方面的不确定性，或许都不再必要，因为执行一个 contract 的成本将被其代码大小所严格上界。

Additionally, Turing-incompleteness is not even that big a limitation; out of all the contract examples we have conceived internally, so far only one required a loop, and even that loop could be removed by making 26 repetitions of a one-line piece of code.

此外，Turing-incompleteness 甚至未必是多么严重的限制；在我们内部设想过的所有 contract 示例中，到目前为止只有一个真正需要循环，而即便是那个循环，也可以通过把一行代码重复 26 次来去掉。

Given the serious implications of Turing-completeness, and the limited benefit, why not simply have a Turing-incomplete language? In reality, however, Turing-incompleteness is far from a neat solution to the problem.

既然 Turing-completeness 影响如此重大，而它带来的收益又有限，那为什么不干脆使用一种 Turing-incomplete 语言呢？但现实中，Turing-incompleteness 远不是这个问题的简洁答案。

To see why, consider the following contracts:

要理解原因，请看下面这些 contracts：

```sh
C0: call(C1); call(C1);
C1: call(C2); call(C2);
C2: call(C3); call(C3);
...
C49: call(C50); call(C50);
C50: (run one step of a program and record the change in storage)
```

Now, send a transaction to A.

现在，向 A 发送一笔 transaction。

Thus, in 51 transactions, we have a contract that takes up 2<sup>50</sup> computational steps.

这样一来，在 51 笔 transactions 中，我们就得到了一个需要 2<sup>50</sup> 个计算步骤的 contract。

Miners could try to detect such logic bombs ahead of time by maintaining a value alongside each contract specifying the maximum number of computational steps that it can take, and calculating this for contracts calling other contracts recursively, but that would require miners to forbid contracts that create other contracts (since the creation and execution of all 26 contracts above could easily be rolled into a single contract).

miners 可以尝试提前检测这类 logic bombs，例如为每个 contract 维护一个值，用来表示它最多可能消耗的计算步骤数，并对递归调用其他 contracts 的 contracts 进行计算；但这将要求 miners 禁止那些会创建其他 contracts 的 contracts（因为上面 26 个 contracts 的创建和执行都可以轻易合并到一个单独的 contract 中）。

Another problematic point is that the address field of a message is a variable, so in general it may not even be possible to tell which other contracts a given contract will call ahead of time.

另一个麻烦之处在于，message 的 address field 是一个变量，因此通常甚至无法提前判断某个给定 contract 会调用哪些其他 contracts。

Hence, all in all, we have a surprising conclusion: Turing-completeness is surprisingly easy to manage, and the lack of Turing-completeness is equally surprisingly difficult to manage unless the exact same controls are in place - but in that case why not just let the protocol be Turing-complete?

因此，综合来看，我们得到一个令人意外的结论：Turing-completeness 其实出奇地容易管理，而缺乏 Turing-completeness 反而同样出奇地难以管理，除非引入完全相同的控制机制；但如果如此，那为什么不干脆让协议本身就是 Turing-complete 呢？

> **Turing-completeness 取舍分析**<br />
> 这段论证是白皮书中最精彩的部分之一.
> 核心逻辑: 不管你是否提供循环, 只要允许 contract 互相调用, 就能构造出任意长的计算.
> 既然限制 Turing-completeness 并不能真正消除风险, 不如坦然接受它, 用 gas 机制作为统一的资源控制手段.
> 这是一个实用主义的工程决策, 而非理论完美主义.

### Currency And Issuance

The Ethereum network includes its own built-in currency, ether, which serves the dual purpose of providing a primary liquidity layer to allow for efficient exchange between various types of digital assets and, more importantly, of providing a mechanism for paying transaction fees.

Ethereum network 内建了自己的货币 ether，它同时承担两个目的：一是提供主要的流动性层，以便各种数字资产之间进行高效交换；更重要的是，它提供了支付 transaction fees 的机制。

For convenience and to avoid future argument (see the current mBTC/uBTC/satoshi debate in Bitcoin), the denominations will be pre-labelled:

为了方便起见，也为了避免未来的争论（可参见 Bitcoin 中当前关于 mBTC/uBTC/satoshi 的争议），各面额将被预先命名：

- 1: wei
  1：wei
- 10<sup>12</sup>: szabo
  10<sup>12</sup>：szabo
- 10<sup>15</sup>: finney
  10<sup>15</sup>：finney
- 10<sup>18</sup>: ether
  10<sup>18</sup>：ether

> **Ether 面额单位**<br />
> 实际使用中, 最常见的是 wei (最小单位) 和 gwei (10<sup>9</sup> wei), 后者用于表示 gas price.
> szabo 和 finney 在实践中几乎从未被使用.
> 命名致敬了密码学和数字货币的先驱: Wei Dai (b-money), Nick Szabo (smart contracts), Hal Finney (RPOW, Bitcoin 早期参与者).

This should be taken as an expanded version of the concept of “dollars” and “cents” or “BTC” and “satoshi”.

这可以被视为“dollars / cents”或“BTC / satoshi”概念的扩展版本。

In the near future, we expect “ether” to be used for ordinary transactions, “finney” for microtransactions and “szabo” and “wei” for technical discussions around fees and protocol implementation; the remaining denominations may become useful later and should not be included in clients at this point.

在不久的将来，我们预计“ether”将用于普通 transactions，“finney”用于 microtransactions，而 “szabo” 和 “wei” 将用于围绕 fees 与协议实现的技术讨论；其余面额未来或许会变得有用，但此时不应纳入 clients。

The issuance model will be as follows:

发行模型如下：

- Ether will be released in a currency sale at the price of 1000-2000 ether per BTC, a mechanism intended to fund the Ethereum organization and pay for development that has been used with success by other platforms such as Mastercoin and NXT.  Earlier buyers will benefit from larger discounts.  The BTC received from the sale will be used entirely to pay salaries and bounties to developers and invested into various for-profit and non-profit projects in the Ethereum and cryptocurrency ecosystem.
  Ether 将通过一次 currency sale 发行，价格为每 BTC 购买 1000-2000 ether。这一机制旨在为 Ethereum organization 提供资金并支付开发费用，其他平台如 Mastercoin 和 NXT 已经成功采用过类似方式。越早购买的买家将享受越大的折扣。此次出售收到的 BTC 将全部用于支付开发者工资与赏金，并投资于 Ethereum 与 cryptocurrency 生态中的各类营利和非营利项目。
- 0.099x the total amount sold (60102216 ETH) will be allocated to the organization to compensate early contributors and pay ETH-denominated expenses before the genesis block.
  总售出数量的 0.099x（60102216 ETH）将分配给组织，用于补偿早期贡献者，并支付 genesis block 之前以 ETH 计价的支出。
- 0.099x the total amount sold will be maintained as a long-term reserve.
  总售出数量的 0.099x 将作为长期储备保留。
- 0.26x the total amount sold will be allocated to miners per year forever after that point.
  从那之后，每年都会把总售出数量的 0.26x 永久分配给 miners。

> **实际发行历史**<br />
> 白皮书中的发行计划与实际执行有较大差异:
> (1) ICO (2014): 售出约 6000 万 ETH, 筹得约 31000 BTC (当时约 1800 万美元).
> (2) PoW 阶段的 block reward 经历了多次降低: 5 ETH → 3 ETH (Byzantium, 2017) → 2 ETH (Constantinople, 2019).
> (3) The Merge (2022) 后, 不再有 mining reward; 新增 ETH 仅来自 PoS 的验证者奖励, 年化约 0.5-1%.
> (4) 配合 EIP-1559 的 base fee 销毁, ETH 总供给在高活跃期甚至会净减少.

| Group<br>组别 | At launch<br>发布时 | After 1 year<br>1 年后 | After 5 years<br>5 年后 |
| :--------------------- | :-------- | :----------- | :------------ |
| Currency units<br>货币总量 | 1.198X | 1.458X | 2.498X |
| Purchasers<br>购买者 | 83.5% | 68.6% | 40.0% |
| Reserve spent pre-sale<br>预售前已使用储备 | 8.26% | 6.79% | 3.96% |
| Reserve used post-sale<br>售后已使用储备 | 8.26% | 6.79% | 3.96% |
| Miners<br>矿工 | 0% | 17.8% | 52.0% |

#### Long-Term Supply Growth Rate (percent)

![Ethereum inflation](https://ethereum.org/content/whitepaper/ethereum-inflation.png)

_Despite the linear currency issuance, just like with Bitcoin over time the supply growth rate nevertheless tends to zero._

_尽管货币发行是线性的，但就像 Bitcoin 一样，随着时间推移，供给增长率仍然会趋近于零。_

The two main choices in the above model are (1) the existence and size of an endowment pool, and (2) the existence of a permanently growing linear supply, as opposed to a capped supply as in Bitcoin.

上述模型中的两个主要选择是：(1) 是否存在以及设定多大的 endowment pool；(2) 是否采用永久增长的线性供给，而不是像 Bitcoin 那样采用上限封顶的供给。

The justification of the endowment pool is as follows.

endowment pool 的理由如下。

If the endowment pool did not exist, and the linear issuance reduced to 0.217x to provide the same inflation rate, then the total quantity of ether would be 16.5% less and so each unit would be 19.8% more valuable.

如果 endowment pool 不存在，并且把线性发行量降到 0.217x 以提供同样的通胀率，那么 ether 总量将减少 16.5%，于是每一个单位都会升值 19.8%。

Hence, in the equilibrium 19.8% more ether would be purchased in the sale, so each unit would once again be exactly as valuable as before.

因此，在均衡状态下，出售中会多卖出 19.8% 的 ether，于是每个单位的价值又会与此前完全相同。

The organization would also then have 1.198x as much BTC, which can be considered to be split into two slices: the original BTC, and the additional 0.198x.

与此同时，组织持有的 BTC 数量也会变成原来的 1.198x，这可以看作分成两部分：原本的 BTC，以及额外多出来的 0.198x。

Hence, this situation is _exactly equivalent_ to the endowment, but with one important difference: the organization holds purely BTC, and so is not incentivized to support the value of the ether unit.

因此，这种情况与 endowment _完全等价_，但有一个重要差别：组织持有的将完全是 BTC，因此它没有激励去支持 ether 单位的价值。

The permanent linear supply growth model reduces the risk of what some see as excessive wealth concentration in Bitcoin, and gives individuals living in present and future eras a fair chance to acquire currency units, while at the same time retaining a strong incentive to obtain and hold ether because the “supply growth rate” as a percentage still tends to zero over time.

永久线性供给增长模型降低了某些人所认为的 Bitcoin 过度财富集中风险，并让生活在当下和未来时代的个体都能公平地获得货币单位；与此同时，由于按百分比计算的“supply growth rate”仍会随时间趋近于零，因此获取并持有 ether 的激励依然很强。

> **线性发行 vs 指数衰减**<br />
> Bitcoin: 总量固定 2100 万, 每 4 年减半 → 发行量指数衰减, 最终归零.
> Ethereum (白皮书设想): 每年固定增发 → 发行量恒定, 但 *增长率* 趋近于零 (因为分母不断增大).
> 实际效果: 两种模型在长期都趋于低通胀, 但线性模型避免了“早期参与者过度获利”的问题.
> 当前现实: EIP-1559 的 burn 机制加上 PoS 的低发行量, 使 ETH 在高活跃期实际上是通缩的.

We also theorize that because coins are always lost over time due to carelessness, death, etc, and coin loss can be modeled as a percentage of the total supply per year, that the total currency supply in circulation will in fact eventually stabilize at a value equal to the annual issuance divided by the loss rate (e.g., at a loss rate of 1%, once the supply reaches 26X then 0.26X will be mined and 0.26X lost every year, creating an equilibrium).

我们还提出一种理论：由于 coins 会随着时间因疏忽、死亡等原因持续丢失，而 coin 的丢失可以建模为总供给按年损失的一个百分比，因此流通中的货币总供给实际上最终会稳定在“年发行量除以损失率”的数值上（例如，当损失率为 1% 时，一旦总供给达到 26X，那么每年会新增挖出 0.26X，同时也损失 0.26X，从而形成平衡）。

Note that in the future, it is likely that Ethereum will switch to a proof-of-stake model for security, reducing the issuance requirement to somewhere between zero and 0.05X per year.

需要注意的是，未来 Ethereum 很可能会切换到 proof-of-stake 安全模型，从而把发行需求降低到每年介于零和 0.05X 之间。

> **The Merge: 已经实现**<br />
> 白皮书中说“未来很可能会切换到 PoS” — 这在 2022 年 9 月 15 日已经完成.
> 从最初设想到最终实现, 这一过渡花了近 9 年.
> 延迟的原因: PoS 的安全性设计极其复杂, 需要解决 “nothing at stake”, “long-range attack” 等诸多难题.
> Ethereum 最终采用的是 Casper FFG + LMD-GHOST 混合共识, 验证者需质押 32 ETH.

In the event that the Ethereum organization loses funding or for any other reason disappears, we leave open a “social contract”: anyone has the right to create a future candidate version of Ethereum, with the only condition being that the quantity of ether must be at most equal to `60102216 * (1.198 + 0.26 * n)` where `n` is the number of years after the genesis block.

如果 Ethereum organization 失去资金来源，或因其他任何原因消失，我们会保留一个“social contract”：任何人都有权创建未来的 Ethereum 候选版本，唯一条件是 ether 的数量最多只能等于 `60102216 * (1.198 + 0.26 * n)`，其中 `n` 是 genesis block 之后经过的年数。

Creators are free to crowd-sell or otherwise assign some or all of the difference between the PoS-driven supply expansion and the maximum allowable supply expansion to pay for development.

创建者可以自由地通过 crowd-sell 或其他方式，把 PoS 驱动的供给扩张与允许的最大供给扩张之间的部分或全部差额分配出来，用于支付开发费用。

Candidate upgrades that do not comply with the social contract may justifiably be forked into compliant versions.

不符合这一 social contract 的候选升级，可以被合理地 fork 成符合要求的版本。

### Mining Centralization

The Bitcoin mining algorithm works by having miners compute SHA256 on slightly modified versions of the block header millions of times over and over again, until eventually one node comes up with a version whose hash is less than the target (currently around 2<sup>192</sup>).

Bitcoin mining algorithm 的工作方式，是让 miners 对略微修改过的 block header 版本反复计算数百万次 SHA256，直到最终有一个节点找到某个版本，使其 hash 小于目标值（目前大约是 2<sup>192</sup>）。

However, this mining algorithm is vulnerable to two forms of centralization.

然而，这种 mining algorithm 容易受到两种形式的中心化影响。

First, the mining ecosystem has come to be dominated by ASICs (application-specific integrated circuits), computer chips designed for, and therefore thousands of times more efficient at, the specific task of Bitcoin mining.

第一，挖矿生态已经被 ASICs（application-specific integrated circuits）所主导；这类芯片专门为 Bitcoin mining 这一特定任务设计，因此在效率上高出普通计算设备数千倍。

This means that Bitcoin mining is no longer a highly decentralized and egalitarian pursuit, requiring millions of dollars of capital to effectively participate in.

这意味着 Bitcoin mining 已不再是一项高度去中心化且平等的活动，想要有效参与其中往往需要数百万美元的资本。

> **ASIC (专用集成电路)**<br />
> 挖矿硬件的演进: CPU → GPU → FPGA → ASIC.
> ASIC 是为特定算法定制的芯片, 效率远超通用硬件, 但只能做一件事.
> 这意味着挖矿门槛大幅提高, 普通人用笔记本电脑挖 Bitcoin 在 2013 年左右就已毫无意义.

Second, most Bitcoin miners do not actually perform block validation locally; instead, they rely on a centralized mining pool to provide the block headers.

第二，大多数 Bitcoin miners 实际上并不在本地执行 block validation；相反，他们依赖中心化 mining pool 提供 block headers。

This problem is arguably worse: as of the time of this writing, the top three mining pools indirectly control roughly 50% of processing power in the Bitcoin network, although this is mitigated by the fact that miners can switch to other mining pools if a pool or coalition attempts a 51% attack.

这个问题可以说更严重：截至本文写作时，排名前三的 mining pools 间接控制着 Bitcoin 网络中大约 50% 的算力，尽管 miners 可以在某个 pool 或联盟尝试 51% attack 时切换到其他 mining pools，从而对这一问题有所缓解。

The current intent at Ethereum is to use a mining algorithm where miners are required to fetch random data from the state, compute some randomly selected transactions from the last N blocks in the blockchain, and return the hash of the result.

Ethereum 当前的打算，是采用一种 mining algorithm：要求 miners 从 state 中提取随机数据，计算 blockchain 最近 N 个 blocks 中随机选取的一些 transactions，并返回结果的 hash。

This has two important benefits.

这有两个重要好处。

First, Ethereum contracts can include any kind of computation, so an Ethereum ASIC would essentially be an ASIC for general computation - i.e., a better CPU.

第一，Ethereum contracts 可以包含任何类型的计算，因此 Ethereum ASIC 本质上会是“通用计算 ASIC”，也就是一种更强的 CPU。

Second, mining requires access to the entire blockchain, forcing miners to store the entire blockchain and at least be capable of verifying every transaction.

第二，mining 需要访问整条 blockchain，这会迫使 miners 存储整个 blockchain，并且至少具备验证每一笔 transaction 的能力。

This removes the need for centralized mining pools; although mining pools can still serve the legitimate role of evening out the randomness of reward distribution, this function can be served equally well by peer-to-peer pools with no central control.

这消除了对中心化 mining pools 的需求；尽管 mining pools 仍可以发挥平滑奖励分布随机性的正当作用，但这一功能同样可以由没有中心控制的 peer-to-peer pools 来完成。

This model is untested, and there may be difficulties along the way in avoiding certain clever optimizations when using contract execution as a mining algorithm.

这一模型尚未经过验证，而且在将 contract execution 用作 mining algorithm 时，可能会遇到难以避免某些巧妙优化的问题。

However, one notably interesting feature of this algorithm is that it allows anyone to “poison the well”, by introducing a large number of contracts into the blockchain specifically designed to stymie certain ASICs.

不过，这一算法有一个非常有趣的特点：它允许任何人通过向 blockchain 中引入大量专门用于阻碍某些 ASICs 的 contracts，来“poison the well”。

The economic incentives exist for ASIC manufacturers to use such a trick to attack each other.

ASIC 制造商之间确实存在使用这种手段互相攻击的经济激励。

Thus, the solution that we are developing is ultimately an adaptive economic human solution rather than purely a technical one.

因此，我们所开发的解决方案，归根结底是一种适应性的经济与人类行为解决方案，而不只是纯技术方案。

> **Ethereum 的 anti-ASIC 历程**<br />
> 白皮书中设想的 mining algorithm 后来具体化为 Ethash: 一种 memory-hard 算法, 设计目标是让 ASIC 相比 GPU 没有太大优势.
> Ethash 在很大程度上实现了这一目标, GPU mining 在整个 PoW 时期一直占主导.
> 但最终, Ethereum 通过切换到 PoS 从根本上解决了 ASIC 问题: PoS 不需要任何专用硬件.

### Scalability

One common concern about Ethereum is the issue of scalability.

人们对 Ethereum 常见的一项担忧，是其 scalability 问题。

Like Bitcoin, Ethereum suffers from the flaw that every transaction needs to be processed by every node in the network.

和 Bitcoin 一样，Ethereum 也存在这样一个缺陷：每一笔 transaction 都需要由网络中的每一个节点处理。

With Bitcoin, the size of the current blockchain rests at about 15 GB, growing by about 1 MB per hour.

在 Bitcoin 中，当前 blockchain 大小约为 15 GB，并且每小时增长约 1 MB。

If the Bitcoin network were to process Visa’s 2000 transactions per second, it would grow by 1 MB per three seconds (1 GB per hour, 8 TB per year).

如果 Bitcoin 网络要处理 Visa 每秒 2000 笔 transactions 的吞吐量，那么它将每三秒增长 1 MB（即每小时 1 GB、每年 8 TB）。

Ethereum is likely to suffer a similar growth pattern, worsened by the fact that there will be many applications on top of the Ethereum blockchain instead of just a currency as is the case with Bitcoin, but ameliorated by the fact that Ethereum full nodes need to store just the state instead of the entire blockchain history.

Ethereum 很可能会经历类似的增长模式，而且由于 Ethereum blockchain 之上会承载许多应用，而不仅仅像 Bitcoin 那样只承载货币，这种增长还会更严重；不过另一方面，Ethereum full nodes 只需要存储 state，而不是整个 blockchain history，这又会在一定程度上缓解问题。

> **可扩展性: blockchain 的核心挑战**<br />
> 这是著名的 “blockchain trilemma” (区块链三难困境) 的体现:
> 去中心化 / 安全性 / 可扩展性 — 三者最多只能同时满足两个.
> 白皮书写作时, 这个问题还没有成熟的解决方案.

> **现实演进: L2 和 Rollups**<br />
> Ethereum 目前的扩容路线已从“链上扩容”转向“以 Rollup 为中心”的 L2 方案:
> (1) Optimistic Rollups (e.g., Optimism, Arbitrum): 乐观假设交易有效, 出错时通过 fraud proof 挑战.
> (2) ZK Rollups (e.g., zkSync, StarkNet): 通过零知识证明在数学上保证正确性.
> 两者都在链下批量执行交易, 只把压缩后的结果提交到 Ethereum 主链, 从而大幅降低成本.
> 2024 年 Dencun 升级引入了 blob 交易 (EIP-4844/proto-danksharding), 进一步降低了 L2 的数据发布成本.

The problem with such a large blockchain size is centralization risk.

如此庞大的 blockchain size 所带来的问题，是中心化风险。

If the blockchain size increases to, say, 100 TB, then the likely scenario would be that only a very small number of large businesses would run full nodes, with all regular users using light SPV nodes.

如果 blockchain size 增长到比如 100 TB，那么很可能只有极少数大型企业还会运行 full nodes，而所有普通用户都会转向使用 light SPV nodes。

In such a situation, there arises the potential concern that the full nodes could band together and all agree to cheat in some profitable fashion (e.g., change the block reward, give themselves BTC).

在这种情况下，就会出现一种潜在担忧：这些 full nodes 可能串通起来，以某种有利可图的方式集体作弊（例如修改 block reward，给自己发放 BTC）。

Light nodes would have no way of detecting this immediately.

light nodes 将无法立即发现这种行为。

Of course, at least one honest full node would likely exist, and after a few hours information about the fraud would trickle out through channels like Reddit, but at that point it would be too late: it would be up to the ordinary users to organize an effort to blacklist the given blocks, a massive and likely infeasible coordination problem on a similar scale as that of pulling off a successful 51% attack.

当然，很可能至少还会有一个诚实的 full node 存在，几小时之后，关于欺诈的信息也会通过 Reddit 之类的渠道慢慢泄露出来；但那时已经太迟了：普通用户必须自行组织起来，试图把这些给定的 blocks 拉入黑名单，而这会成为一个规模巨大且很可能不可行的协同问题，其难度与成功发动一次 51% attack 相当。

In the case of Bitcoin, this is currently a problem, but there exists a blockchain modification [suggested by Peter Todd](https://web.archive.org/web/20140623061815/http://sourceforge.net/p/bitcoin/mailman/message/31709140/) which will alleviate this issue.

对 Bitcoin 而言，这目前也是一个问题，不过已经存在一种由 [Peter Todd 提出](https://web.archive.org/web/20140623061815/http://sourceforge.net/p/bitcoin/mailman/message/31709140/) 的 blockchain 修改方案，可以缓解这一问题。

In the near term, Ethereum will use two additional strategies to cope with this problem.

在短期内，Ethereum 将采用另外两种策略来应对这一问题。

First, because of the blockchain-based mining algorithms, at least every miner will be forced to be a full node, creating a lower bound on the number of full nodes.

第一，由于 mining algorithms 基于 blockchain，因此至少每一个 miner 都将被迫成为 full node，从而给 full node 的数量设立一个下界。

Second and more importantly, however, we will include an intermediate state tree root in the blockchain after processing each transaction.

第二，也是更重要的一点，我们会在每处理完一笔 transaction 之后，就把一个中间 state tree root 写入 blockchain。

Even if block validation is centralized, as long as one honest verifying node exists, the centralization problem can be circumvented via a verification protocol.

即便 block validation 已经中心化，只要还存在一个诚实的 verifying node，这个中心化问题也可以通过一种 verification protocol 被绕开。

If a miner publishes an invalid block, that block must either be badly formatted, or the state `S[n]` is incorrect.

如果某个 miner 发布了一个无效 block，那么这个 block 要么格式错误，要么 state `S[n]` 不正确。

Since `S[0]` is known to be correct, there must be some first state `S[i]` that is incorrect where `S[i-1]` is correct.

由于 `S[0]` 已知是正确的，那么必然存在某个第一个错误的 state `S[i]`，并且其前一个 state `S[i-1]` 是正确的。

The verifying node would provide the index `i`, along with a “proof of invalidity” consisting of the subset of Patricia tree nodes needing to process `APPLY(S[i-1], TX[i]) -> S[i]`.

verifying node 会给出索引 `i`，同时附上一份“proof of invalidity”，它由处理 `APPLY(S[i-1], TX[i]) -> S[i]` 所需的 Patricia tree 节点子集构成。

Nodes would be able to use those nodes to run that part of the computation, and see that the `S[i]` generated does not match the `S[i]` provided.

其他节点就可以用这些节点数据来执行那一部分计算，并看到生成出的 `S[i]` 与所提供的 `S[i]` 并不一致。

Another, more sophisticated, attack would involve the malicious miners publishing incomplete blocks, so the full information does not even exist to determine whether or not blocks are valid.

另一种更复杂的攻击，则是恶意 miners 发布不完整的 blocks，使得判定这些 blocks 是否有效所需的完整信息根本不存在。

The solution to this is a challenge-response protocol: verification nodes issue “challenges” in the form of target transaction indices, and upon receiving a node a light node treats the block as untrusted until another node, whether the miner or another verifier, provides a subset of Patricia nodes as a proof of validity.

对此的解决方案是一种 challenge-response protocol：verification nodes 以目标 transaction 索引的形式发出“challenges”，而 light node 在收到某个 block 后，会把它视为不可信，直到另一个节点，不论是 miner 还是其他 verifier，提供一组 Patricia nodes 子集作为有效性证明。

> **fraud proof 与 validity proof**<br />
> 白皮书此处描述的 challenge-response 机制, 就是后来 fraud proof (欺诈证明) 的雏形.
> 现代 Ethereum 生态中, 这一思想在两个层面都有应用:
> (1) Optimistic Rollups 使用 fraud proof: 先乐观地接受结果, 有人挑战时才验证.
> (2) ZK Rollups 使用 validity proof: 提交结果时就附带数学证明, 无需等待挑战期.
> 后者更快 (无等待期), 但生成证明的计算成本更高.

## Conclusion

The Ethereum protocol was originally conceived as an upgraded version of a cryptocurrency, providing advanced features such as on-blockchain escrow, withdrawal limits, financial contracts, gambling markets and the like via a highly generalized programming language.

Ethereum protocol 最初被构想为 cryptocurrency 的升级版，通过一种高度泛化的编程语言提供链上 escrow、提现限额、金融合约、赌博市场等高级特性。

The Ethereum protocol would not “support” any of the applications directly, but the existence of a Turing-complete programming language means that arbitrary contracts can theoretically be created for any transaction type or application.

Ethereum protocol 并不会直接“支持”这些应用中的任何一种，但由于存在 Turing-complete 编程语言，理论上就可以为任何 transaction 类型或应用创建任意 contracts。

What is more interesting about Ethereum, however, is that the Ethereum protocol moves far beyond just currency.

然而，Ethereum 更有意思的地方在于，Ethereum protocol 远远超越了单纯的货币范畴。

Protocols around decentralized file storage, decentralized computation and decentralized prediction markets, among dozens of other such concepts, have the potential to substantially increase the efficiency of the computational industry, and provide a massive boost to other peer-to-peer protocols by adding for the first time an economic layer.

围绕 decentralized file storage、decentralized computation、decentralized prediction markets 等数十种概念的协议，有潜力显著提升计算产业的效率，并且由于首次引入经济层，还会极大推动其他 peer-to-peer protocols 的发展。

Finally, there is also a substantial array of applications that have nothing to do with money at all.

最后，还有大量完全与金钱无关的应用。

The concept of an arbitrary state transition function as implemented by the Ethereum protocol provides for a platform with unique potential; rather than being a closed-ended, single-purpose protocol intended for a specific array of applications in data storage, gambling or finance, Ethereum is open-ended by design, and we believe that it is extremely well-suited to serving as a foundational layer for a very large number of both financial and non-financial protocols in the years to come.

Ethereum protocol 所实现的任意状态转移函数概念，为其提供了一个具有独特潜力的平台；Ethereum 并不是一个面向特定数据存储、赌博或金融应用集合的封闭式单用途协议，而是在设计上就是开放式的。我们相信，在未来很多年里，它将非常适合作为大量金融与非金融协议的基础层。

> **结语**<br />
> 回顾这篇 2013 年的白皮书, 其远见令人惊叹:
> token systems → ERC-20 和数以万计的 tokens;
> 金融衍生品和稳定币 → DeFi (Uniswap, Aave, MakerDAO);
> DAO → 数百个 DAO 管理着数十亿美元;
> 去中心化存储 → IPFS, Filecoin, Arweave;
> 预测市场 → Polymarket.
> 白皮书没有预见到的: NFT 的爆发, MEV (矿工可提取价值) 问题, L2 生态的蓬勃发展.
> 尽管具体实现与白皮书描述多有不同 (PoS 替代 PoW, EIP-1559 改革 fee 模型, account abstraction 等), 但核心理念始终如一: 一个通用的、可编程的去中心化计算平台.

## Further Reading

1. [Intrinsic value](https://bitcoinmagazine.com/culture/an-exploration-of-intrinsic-value-what-it-is-why-bitcoin-doesnt-have-it-and-why-bitcoin-does-have-it)
2. [Smart property](https://en.bitcoin.it/wiki/Smart_Property)
3. [Smart contracts](https://en.bitcoin.it/wiki/Contracts)
4. [B-money](http://www.weidai.com/bmoney.txt)
5. [Reusable proofs of work](https://nakamotoinstitute.org/finney/rpow/)
6. [Secure property titles with owner authority](https://nakamotoinstitute.org/library/secure-property-titles/)
7. [Bitcoin whitepaper](http://bitcoin.org/bitcoin.pdf)
8. [Namecoin](https://namecoin.org/)
9. [Zooko’s triangle](https://wikipedia.org/wiki/Zooko's_triangle)
10. [Colored coins whitepaper](https://docs.google.com/a/buterin.com/document/d/1AnkP_cVZTCMLIzw4DvsW6M8Q2JC0lIzrTLuoWu2z1BE/edit)
11. [Mastercoin whitepaper](https://github.com/mastercoin-MSC/spec)
12. [Decentralized autonomous corporations, Bitcoin Magazine](http://bitcoinmagazine.com/7050/bootstrapping-a-decentralized-autonomous-corporation-part-i/)
13. [Simplified payment verification](https://en.bitcoin.it/wiki/Scalability#Simplified_payment_verification)
14. [Merkle trees](https://wikipedia.org/wiki/Merkle_tree)
15. [Patricia trees](https://wikipedia.org/wiki/Patricia_tree)
16. [GHOST](https://eprint.iacr.org/2013/881.pdf)
17. [StorJ and Autonomous Agents, Jeff Garzik](http://garzikrants.blogspot.ca/2013/01/storj-and-bitcoin-autonomous-agents.html)
18. [Mike Hearn on Smart Property at Turing Festival](https://www.youtube.com/watch?v=MVyv4t0OKe4)
19. [Ethereum RLP](https://ethereum.org/developers/docs/data-structures-and-encoding/rlp/)
20. [Ethereum Merkle Patricia trees](https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie/)
21. [Peter Todd on Merkle sum trees](https://web.archive.org/web/20140623061815/http://sourceforge.net/p/bitcoin/mailman/message/31709140/)


[^1]: A sophisticated reader may notice that in fact a Bitcoin address is the hash of the elliptic curve public key, and not the public key itself.  However, it is in fact perfectly legitimate cryptographic terminology to refer to the pubkey hash as a public key itself.  This is because Bitcoin’s cryptography can be considered to be a custom digital signature algorithm, where the public key consists of the hash of the ECC pubkey, the signature consists of the ECC pubkey concatenated with the ECC signature, and the verification algorithm involves checking the ECC pubkey in the signature against the ECC pubkey hash provided as a public key and then verifying the ECC signature against the ECC pubkey.  较为熟悉细节的读者可能会注意到，实际上 Bitcoin address 是椭圆曲线公钥的 hash，而不是公钥本身。不过，在密码学术语中，把 pubkey hash 本身称作公钥也完全合理。这是因为 Bitcoin 的密码学可以被看作一种定制的数字签名算法：其中公钥由 ECC pubkey 的 hash 构成，签名由 ECC pubkey 与 ECC signature 拼接而成，而验证算法则包括检查签名中的 ECC pubkey 是否与作为公钥提供的 ECC pubkey hash 匹配，然后再用该 ECC pubkey 验证 ECC signature。

[^2]: Technically, the median of the 11 previous blocks.  更准确地说，是前 11 个 blocks 的中位数。

[^3]: Internally, 2 and “CHARLIE” are both numbers[^3], with the latter being in big-endian base 256 representation.  Numbers can be at least 0 and at most 2<sup>256</sup>-1.  在内部表示上，2 和 “CHARLIE” 都是数字[^3]，其中后者采用 big-endian 的 256 进制表示。数字的最小值可以是 0，最大值可以是 2<sup>256</sup>-1。
