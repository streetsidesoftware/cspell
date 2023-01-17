# Simple Workflow Debounce

This is an implementation of a leading edge debounce.

The goal is to provide a way for a workflow to short circuit if many events call it in a short period of time.

This action uses the workflow [Cache Save](https://github.com/actions/cache/tree/main/save#readme) and [Cache Restore](https://github.com/actions/cache/tree/main/save#readme) to store a timestamp of the accepted workflow.

## Logic

```seqdiag
title Simple Debounce

participant "Event 1" as E1
participant "Workflow 1" as W1
participant "Debounce\nInstance" as B1
database "Cache-Outer" as G
database Cache


E1->*W1: trigger
W1->*B1: should run?
Cache->B1: Read:\n Timestamp Entry
note over B1: Should Update?
B1-->W1: No
W1-->E1: Stop
note over B1: Yes
activate B1
B1->G: Write:\n Timestamp Entry
G->Cache: Write
Cache->B1: Read
note over B1: Was it our write?
B1-->W1: No
W1-->E1: Stop
note over B1: Yes
B1->W1: Yes
deactivate B1
destroy B1
```
