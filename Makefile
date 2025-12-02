.PHONY: dev_next
dev_next:
	pnpm turbo dev \
	    --filter=@authdog-samples/nextjs-app

.PHONY: ship_next_demo
ship_next_demo:
	pnpm turbo ship-demo \
	    --filter=@authdog-samples/nextjs-app
	
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
	    --filter=@authdog* \
		--filter=!@authdog-samples/*

.PHONY: build_libs
build_libs:
	pnpm turbo build \
	    --filter=@authdog/react-elements \
		--filter=@authdog/remix-node


.PHONY: ui
ui:
	pnpm turbo cosmos \
	    --filter=@authdog/react-elements


