.PHONY: dev_next
dev_next:
	pnpm turbo dev \
	    --filter=@playground/nextjs

.PHONY: ship_next_demo
ship_next_demo:
	pnpm turbo ship-demo \
	    --filter=@playground/nextjs
	
.PHONY: dev_remix
dev_remix:
	pnpm turbo dev \
	    --filter=@playground/remix

.PHONY: format
format:
	pnpm format

.PHONY: setup clean run install

.PHONY: build
build:
	pnpm turbo build \
	    --filter=@authdog*