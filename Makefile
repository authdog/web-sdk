.PHONY: dev_next
dev_next:
	pnpm turbo dev \
	    --filter=@authdog-playground/nextjs

.PHONY: ship_next_demo
ship_next_demo:
	pnpm turbo ship-demo \
	    --filter=@authdog-playground/nextjs
	
.PHONY: dev_remix
dev_remix:
	pnpm turbo dev \
	    --filter=@authdog-playground/remix

.PHONY: format
format:
	pnpm format

.PHONY: setup clean run install

.PHONY: build
build:
	pnpm turbo build \
	    --filter=@authdog*

# VENV_NAME = venv
# PYTHON = python3
# VENV_PYTHON = $(VENV_NAME)/bin/python
# VENV_PIP = $(VENV_NAME)/bin/pip

# install: clean setup
# 	@echo "Installation complete! Run 'make run' to start the application."

# setup: $(VENV_NAME)
# 	$(VENV_PIP) install --upgrade pip
# 	$(VENV_PIP) install -r requirements.txt

# $(VENV_NAME):
# 	$(PYTHON) -m venv $(VENV_NAME)

# clean:
# 	rm -rf $(VENV_NAME)
# 	find . -type d -name "__pycache__" -exec rm -rf {} +
# 	find . -type f -name "*.pyc" -delete

# run: setup
# 	$(VENV_PYTHON) minimal_llm.py

# activate:
# 	@echo "To activate the virtual environment, run:"
# 	@echo "source $(VENV_NAME)/bin/activate"