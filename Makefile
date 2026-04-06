.PHONY: dev_next
dev_next:
	bunx turbo dev \
	    --filter=@authdog-samples/nextjs-app

.PHONY: ship_next_demo
ship_next_demo:
	bunx turbo ship-demo \
	    --filter=@authdog-samples/nextjs-app
	
.PHONY: dev_remix
dev_remix:
	bunx turbo dev \
	    --filter=@playground/remix

.PHONY: format
format:
	bun run format

.PHONY: setup clean run install

.PHONY: build
build:
	bunx turbo build \
	    --filter=@authdog* \
		--filter=!@authdog-samples/*

.PHONY: build_libs
build_libs:
	bunx turbo build \
	    --filter=@authdog/react-elements \
		--filter=@authdog/remix-node


.PHONY: ui
ui:
	bunx turbo cosmos \
	    --filter=@authdog/react-elements


