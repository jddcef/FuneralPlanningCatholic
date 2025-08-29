from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # Expand all the details sections
        page.click('text=Read more about the Vigil')
        page.click('text=Read more about the Funeral Service')
        page.click('text=View Important Notes on Interment Options')

        # Take a screenshot of the "Understanding" section
        understanding_section = page.locator('#understanding')
        understanding_section.screenshot(path='jules-scratch/verification/verification.png')

        browser.close()

if __name__ == '__main__':
    run()
