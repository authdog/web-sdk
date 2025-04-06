.PHONY: dev_next
dev_next:
	pnpm turbo dev \
	    --filter=@authdog-playground/nextjs

.PHONY: ship_next_demo
ship_next_demo:
	pnpm turbo ship-demo \
	    --filter=@authdog-playground/nextjs


.PHONY: format
format:
	pnpm format