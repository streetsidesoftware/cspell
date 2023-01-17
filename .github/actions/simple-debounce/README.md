# Simple Workflow Debounce

This is an implementation of a leading edge debounce.

The goal is to provide a way for a workflow to short circuit if many events call it in a short period of time.

This action uses the workflow [Cache Save](https://github.com/actions/cache/tree/main/save#readme) and [Cache Restore](https://github.com/actions/cache/tree/main/save#readme) to store a timestamp of the accepted workflow.
