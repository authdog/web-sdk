# .PHONY: build-deps
# build-deps:
# 	pnpm turbo build \
# 		--filter=@authdog/nextjs-app

.PHONY: dev-next
dev-next:
	pnpm turbo dev \
	    --filter=@authdog-playground/nextjs
