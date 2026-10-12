# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-smoke.spec.js >> selecting a hymn and reading persists to localStorage
- Location: tests/app-smoke.spec.js:12:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.check: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="hymn"]').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: Catholic Funeral Planner
        - generic [ref=e6]:
          - link "Home" [ref=e7] [cursor=pointer]:
            - /url: "#home"
          - link "Understanding" [ref=e8] [cursor=pointer]:
            - /url: "#understanding"
          - link "Planning Tools" [ref=e9] [cursor=pointer]:
            - /url: "#planning"
          - link "Musical Inspiration" [ref=e10] [cursor=pointer]:
            - /url: "#musical-inspiration"
          - link "Order of Service" [ref=e11] [cursor=pointer]:
            - /url: "#order-of-service"
          - link "Background" [ref=e12] [cursor=pointer]:
            - /url: "#background"
          - link "Downloads" [ref=e13] [cursor=pointer]:
            - /url: "#downloads"
          - link "Costs" [ref=e14] [cursor=pointer]:
            - /url: "#costs"
          - link "FAQ" [ref=e15] [cursor=pointer]:
            - /url: "#faq"
          - link "Contact" [ref=e16] [cursor=pointer]:
            - /url: "#contact"
        - generic [ref=e17]:
          - combobox [ref=e18]:
            - option "🇺🇸 English" [selected]
            - option "🇿🇦 Afrikaans"
            - option "🇿🇦 isiXhosa"
          - button [ref=e19]
      - generic [ref=e22]:
        - link "Home" [ref=e23] [cursor=pointer]:
          - /url: "#home"
        - link "Understanding" [ref=e24] [cursor=pointer]:
          - /url: "#understanding"
        - link "Planning Tools" [ref=e25] [cursor=pointer]:
          - /url: "#planning"
        - link "Musical Inspiration" [ref=e26] [cursor=pointer]:
          - /url: "#musical-inspiration"
        - link "Order of Service" [ref=e27] [cursor=pointer]:
          - /url: "#order-of-service"
        - link "Background" [ref=e28] [cursor=pointer]:
          - /url: "#background"
        - link "Downloads" [ref=e29] [cursor=pointer]:
          - /url: "#downloads"
        - link "Costs" [ref=e30] [cursor=pointer]:
          - /url: "#costs"
        - link "FAQ" [ref=e31] [cursor=pointer]:
          - /url: "#faq"
        - link "Contact" [ref=e32] [cursor=pointer]:
          - /url: "#contact"
  - main [ref=e33]:
    - generic [ref=e35]:
      - heading "Catholic Funeral Planner" [level=1] [ref=e36]
      - generic [ref=e37]:
        - paragraph [ref=e39]: Welcome to our Catholic Funeral Planning Guide. Whether you are grieving a loved one, preparing for your own arrangements, or simply curious about Catholic funeral traditions, this site is here to help.
        - paragraph [ref=e41]:
          - text: 💙
          - strong [ref=e42]: Our condolences
          - text: to you and your loved ones. May you find comfort in the hope of the resurrection and the love of your community during this difficult time.
      - generic [ref=e43]:
        - link "Start Planning" [ref=e44] [cursor=pointer]:
          - /url: "#planning"
        - link "Learn More" [ref=e45] [cursor=pointer]:
          - /url: "#understanding"
    - generic [ref=e46]:
      - heading "Understanding the Catholic Funeral" [level=2] [ref=e47]
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: "1"
          - generic [ref=e52]:
            - heading "Vigil / Wake" [level=3] [ref=e53]
            - paragraph [ref=e54]: Evening before
        - generic [ref=e58]:
          - generic [ref=e59]: "2"
          - generic [ref=e60]:
            - heading "Funeral Service" [level=3] [ref=e61]
            - paragraph [ref=e62]: Main ceremony
        - generic [ref=e66]:
          - generic [ref=e67]: "3"
          - generic [ref=e68]:
            - heading "Burial / Interment" [level=3] [ref=e69]
            - paragraph [ref=e70]: Final resting place
      - generic [ref=e71]:
        - generic [ref=e72]:
          - heading "The Vigil / Wake" [level=3] [ref=e73]
          - paragraph [ref=e74]:
            - text: A prayer service held the evening before the funeral, often at a funeral home or church.
            - strong [ref=e75]: "Pastoral Tip:"
            - text: The Vigil can also be held at home if other locations are not possible.
          - group [ref=e76]:
            - generic "▶Read more about the Vigil" [ref=e77]
        - generic [ref=e78]:
          - heading "The Funeral Service" [level=3] [ref=e79]
          - paragraph [ref=e80]: The central liturgical celebration. This may be a full Requiem Mass with Eucharist, or a funeral service without Mass, depending on circumstances and parish practice.
          - group [ref=e81]:
            - generic "▶Read more about the Funeral Service" [ref=e82]
        - generic [ref=e83]:
          - heading "The Burial / Interment" [level=3] [ref=e84]
          - paragraph [ref=e85]: Final prayers at the gravesite, mausoleum, columbarium, or garden of remembrance, committing the body to its final resting place.
          - paragraph [ref=e86]: It is the final act of the community in caring for the body, entrusting it to the earth until the resurrection.
          - group [ref=e87]:
            - generic "▶View Important Notes on Interment Options" [ref=e88]
    - generic [ref=e89]:
      - heading "Planning Tools" [level=2] [ref=e90]
      - generic [ref=e91]:
        - heading "Church Information" [level=3] [ref=e92]
        - generic [ref=e93]:
          - generic [ref=e94]:
            - text: Church Name
            - textbox "Church Name" [ref=e95]: Catholic Church
            - paragraph [ref=e96]: This will appear on your planning booklet cover
          - generic [ref=e97]:
            - text: Cover Image
            - generic [ref=e98]:
              - generic [ref=e99]: ⛪
              - generic [ref=e100]:
                - button "Change Image" [ref=e101]
                - paragraph [ref=e102]: Click to upload custom image
            - button "Choose File" [ref=e103]
      - generic [ref=e104]:
        - heading "Hymn Selection" [level=3] [ref=e106]
        - generic [ref=e107]:
          - heading "Reading Selection" [level=3] [ref=e108]
          - generic [ref=e109]:
            - text: "Filter by theme:"
            - combobox "Filter by theme:" [ref=e110]:
              - option "All Themes" [selected]
      - generic [ref=e111]:
        - generic [ref=e112]:
          - button "📄 Download PDF Booklet" [ref=e113]
          - button "📝 Download DOCX Booklet" [ref=e114]
        - link "Reset/Start Over" [ref=e116] [cursor=pointer]:
          - /url: "#"
    - generic [ref=e117]:
      - heading "Musical Inspiration" [level=2] [ref=e118]
      - generic [ref=e119]:
        - paragraph [ref=e120]: For additional musical inspiration, you can listen to this playlist of popular Catholic funeral hymns. This can help you get a feel for the different styles and moods of music available.
        - link "Listen on YouTube" [ref=e122] [cursor=pointer]:
          - /url: https://www.youtube.com/playlist?list=PL_eUeXuxn-VG77JxIVua8MN4NgHMj3rMw
    - heading "Booklet Preview" [level=2] [ref=e124]
    - generic [ref=e125]:
      - heading "Order of Service" [level=2] [ref=e126]
      - generic [ref=e129]:
        - button "Funeral Mass" [ref=e130]
        - button "Funeral Service" [ref=e131]
        - button "Vigil" [ref=e132]
      - generic [ref=e133]:
        - button [ref=e134]
        - button [ref=e135]
        - button [ref=e136]
      - generic [ref=e137]:
        - generic [ref=e138]:
          - heading "Funeral Mass (Full Service)" [level=3] [ref=e139]
          - list [ref=e140]:
            - listitem [ref=e141]:
              - strong [ref=e142]: "1."
              - text: Reception of the Body/Ashes
            - listitem [ref=e143]:
              - strong [ref=e144]: "2."
              - text: Opening Prayer
            - listitem [ref=e145]:
              - strong [ref=e146]: "3."
              - text: Liturgy of the Word
              - list [ref=e147]:
                - listitem [ref=e148]: • First Reading
                - listitem [ref=e149]: • Responsorial Psalm
                - listitem [ref=e150]: • Second Reading
                - listitem [ref=e151]: • Gospel Acclamation
                - listitem [ref=e152]: • Gospel Reading
                - listitem [ref=e153]: • Homily
            - listitem [ref=e154]:
              - strong [ref=e155]: "4."
              - text: Liturgy of the Eucharist
              - list [ref=e156]:
                - listitem [ref=e157]: • Preparation of the Gifts
                - listitem [ref=e158]: • Eucharistic Prayer
                - listitem [ref=e159]: • Communion
            - listitem [ref=e160]:
              - strong [ref=e161]: "5."
              - text: Final Commendation
            - listitem [ref=e162]:
              - strong [ref=e163]: "6."
              - text: Procession to Place of Committal
        - generic [ref=e164]:
          - heading "Funeral Service (Without Eucharist)" [level=3] [ref=e165]
          - list [ref=e166]:
            - listitem [ref=e167]:
              - strong [ref=e168]: "1."
              - text: Reception of the Body/Ashes
            - listitem [ref=e169]:
              - strong [ref=e170]: "2."
              - text: Opening Prayer
            - listitem [ref=e171]:
              - strong [ref=e172]: "3."
              - text: Liturgy of the Word
              - list [ref=e173]:
                - listitem [ref=e174]: • First Reading
                - listitem [ref=e175]: • Responsorial Psalm
                - listitem [ref=e176]: • Second Reading
                - listitem [ref=e177]: • Gospel Acclamation
                - listitem [ref=e178]: • Gospel Reading
                - listitem [ref=e179]: • Homily
            - listitem [ref=e180]:
              - strong [ref=e181]: "4."
              - text: Final Commendation
            - listitem [ref=e182]:
              - strong [ref=e183]: "5."
              - text: Procession to Place of Committal
        - generic [ref=e184]:
          - heading "Vigil Service (Evening Before)" [level=3] [ref=e185]
          - list [ref=e186]:
            - listitem [ref=e187]:
              - strong [ref=e188]: "1."
              - text: Opening Prayer
            - listitem [ref=e189]:
              - strong [ref=e190]: "2."
              - text: Scripture Reading
            - listitem [ref=e191]:
              - strong [ref=e192]: "3."
              - text: Responsorial Psalm
            - listitem [ref=e193]:
              - strong [ref=e194]: "4."
              - text: Gospel Reading
            - listitem [ref=e195]:
              - strong [ref=e196]: "5."
              - text: Homily or Reflection
            - listitem [ref=e197]:
              - strong [ref=e198]: "6."
              - text: Intercessions
            - listitem [ref=e199]:
              - strong [ref=e200]: "7."
              - text: Lord's Prayer
            - listitem [ref=e201]:
              - strong [ref=e202]: "8."
              - text: Final Blessing
    - generic [ref=e203]:
      - heading "Downloads" [level=2] [ref=e204]
      - generic [ref=e205]:
        - generic [ref=e206]:
          - heading "Last Conversations Deck" [level=3] [ref=e207]
          - paragraph [ref=e208]: A tool to help facilitate conversations about end-of-life wishes.
          - link "Open Resource" [ref=e209] [cursor=pointer]:
            - /url: /last-conversations-deck/
        - generic [ref=e210]:
          - heading "Checklist" [level=3] [ref=e211]
          - paragraph [ref=e212]: Step-by-step funeral planning checklist with all essential tasks and considerations.
          - generic [ref=e213]:
            - button "Download PDF" [ref=e214]
            - generic [ref=e215]:
              - button [ref=e216]
              - generic [ref=e219]:
                - button "📄 PDF" [ref=e220]
                - button "📝 DOCX" [ref=e221]
        - generic [ref=e222]:
          - heading "Program Template" [level=3] [ref=e223]
          - paragraph [ref=e224]: Editable funeral program template with sample text and formatting.
          - generic [ref=e225]:
            - button "Download PDF" [ref=e226]
            - generic [ref=e227]:
              - button [ref=e228]
              - generic [ref=e231]:
                - button "📄 PDF" [ref=e232]
                - button "📝 DOCX" [ref=e233]
        - generic [ref=e234]:
          - heading "Reading Booklet" [level=3] [ref=e235]
          - paragraph [ref=e236]: Complete collection of approved Catholic funeral readings with themes.
          - generic [ref=e237]:
            - button "Download PDF" [ref=e238]
            - generic [ref=e239]:
              - button [ref=e240]
              - generic [ref=e243]:
                - button "📄 PDF" [ref=e244]
                - button "📝 DOCX" [ref=e245]
        - generic [ref=e246]:
          - heading "Vigil Prayer Sheet" [level=3] [ref=e247]
          - paragraph [ref=e248]: Prayer service outline and suggested prayers for the vigil service.
          - generic [ref=e249]:
            - button "Download PDF" [ref=e250]
            - generic [ref=e251]:
              - button [ref=e252]
              - generic [ref=e255]:
                - button "📄 PDF" [ref=e256]
                - button "📝 DOCX" [ref=e257]
    - generic [ref=e258]:
      - heading "Potential Costs & Fees" [level=2] [ref=e259]
      - generic [ref=e260]:
        - generic [ref=e261]:
          - generic [ref=e262]:
            - heading "Church & Ministry" [level=3] [ref=e263]
            - list [ref=e264]:
              - listitem [ref=e265]: Priest or Deacon At own discretion
              - listitem [ref=e266]: Stole fee Towards the church
              - listitem [ref=e267]: A stole fee is a traditional offering given to the priest or deacon who presides over the funeral service. The stole is the liturgical vestment worn around the neck, symbolizing the yoke of Christ and the priest's authority to administer sacraments.
              - listitem [ref=e268]: Organist R500 - R1,500
              - listitem [ref=e269]: Altar servers R100 - R300 each
              - listitem [ref=e270]: Church hall rental R500 - R1,500
          - generic [ref=e271]:
            - heading "Additional Services" [level=3] [ref=e272]
            - list [ref=e273]:
              - listitem [ref=e274]: Tea/refreshments in hall Optional
              - listitem [ref=e275]: Funeral home services R15,000 - R45,000
              - listitem [ref=e276]: Cemetery plot R8,000 - R25,000
              - listitem [ref=e277]: Headstone/marker R3,000 - R15,000
        - generic [ref=e278]:
          - heading "Biblical Guidance on Church Contributions" [level=4] [ref=e279]
          - paragraph [ref=e280]:
            - strong [ref=e281]: "Church Contributions:"
            - text: The biblical practice of giving to God's work. For funeral services, contributions to the church are at the family's discretion, considering their means and relationship with the parish community.
          - paragraph [ref=e282]:
            - strong [ref=e283]: "Regular Contributors:"
            - text: Families who regularly support the church may receive reduced fees or be asked for a smaller donation, as they are already contributing to the parish community.
          - paragraph [ref=e284]:
            - strong [ref=e285]: "Note:"
            - text: Costs vary significantly by location and specific requirements. Contact your parish office for current local rates and donation guidelines.
    - generic [ref=e286]:
      - heading "Background on Catholic Funerals" [level=2] [ref=e287]
      - generic [ref=e288]:
        - generic [ref=e289]:
          - heading "Historical and Theological Foundation" [level=3] [ref=e290]
          - generic [ref=e291]:
            - paragraph [ref=e292]: Catholic funeral rites have their roots in ancient Christian tradition, dating back to the early Church. The practice of praying for the dead is mentioned in the Bible (2 Maccabees 12:44-45) and has been a consistent part of Catholic teaching throughout history.
            - paragraph [ref=e293]: The Church teaches that death is not the end but a transition to eternal life. Catholic funerals express this hope through prayers, Scripture readings, and the celebration of the Eucharist, emphasizing the resurrection of Christ and the promise of eternal life for believers.
            - paragraph [ref=e294]: The three-part structure (Vigil, Funeral Service, and Committal) reflects the Church's understanding of death as a communal experience that requires prayer, remembrance, and proper burial rites.
        - generic [ref=e295]:
          - heading "Spiritual and Pastoral Care" [level=3] [ref=e296]
          - generic [ref=e297]:
            - paragraph [ref=e298]: Catholic funerals provide spiritual comfort to the bereaved through the power of prayer and the support of the faith community. The liturgy offers consolation while acknowledging the reality of grief and loss.
            - paragraph [ref=e299]: The Church recognizes that each person's journey of faith is unique. Funeral rites can be adapted to reflect the individual's life while maintaining the essential elements of Catholic tradition and theology.
            - paragraph [ref=e300]: Pastoral care extends beyond the funeral service itself, with ongoing support available through parish ministries, bereavement groups, and individual counseling.
        - generic [ref=e301]:
          - heading "Cultural and Regional Variations" [level=3] [ref=e302]
          - generic [ref=e303]:
            - paragraph [ref=e304]: While the core elements of Catholic funeral rites remain consistent worldwide, cultural traditions and regional customs often influence how these rites are celebrated. This diversity reflects the universal nature of the Catholic Church.
            - paragraph [ref=e305]: In South Africa, Catholic funerals may incorporate local cultural elements, music, and languages while maintaining the essential liturgical structure. The Church encourages respectful integration of cultural traditions.
            - paragraph [ref=e306]: Local parishes often provide guidance on balancing universal Catholic practice with cultural sensitivity and family preferences.
        - generic [ref=e307]:
          - heading "Modern Considerations" [level=3] [ref=e308]
          - generic [ref=e309]:
            - paragraph [ref=e310]: Contemporary Catholic funerals address modern challenges while preserving traditional values. Issues such as cremation, mixed-faith families, and digital memorials are approached with pastoral sensitivity and theological clarity.
            - paragraph [ref=e311]: The Church recognizes that families today may have diverse needs and circumstances. Funeral planning tools and resources help families navigate these complexities while honoring both their loved one and their faith tradition.
            - paragraph [ref=e312]: Technology has enhanced funeral planning and communication, making it easier for families to coordinate services and share information while maintaining the sacred nature of the funeral rites.
    - generic [ref=e313]:
      - heading "Frequently Asked Questions" [level=2] [ref=e314]
      - generic [ref=e315]:
        - generic [ref=e316]:
          - generic [ref=e317]:
            - heading "What is the difference between a vigil and a funeral mass?" [level=3] [ref=e318]
            - paragraph [ref=e319]: The vigil is a prayer service held the evening before the funeral, while the funeral service is the main liturgical celebration.
          - generic [ref=e320]:
            - heading "How many readings should be selected?" [level=3] [ref=e321]
            - paragraph [ref=e322]: Typically, you'll need one First Reading, one Psalm, one Second Reading, and one Gospel reading.
          - generic [ref=e323]:
            - heading "Can I customize the funeral program?" [level=3] [ref=e324]
            - paragraph [ref=e325]: Yes, you can download our editable templates and customize them according to your needs.
          - generic [ref=e326]:
            - heading "Can cremation be Catholic?" [level=3] [ref=e327]
            - paragraph [ref=e328]: Yes, the Catholic Church permits cremation, though burial is preferred. The cremated remains should be treated with respect and buried or placed in a columbarium.
        - generic [ref=e329]:
          - generic [ref=e330]:
            - heading "What if the person wasn't a practicing Catholic?" [level=3] [ref=e331]
            - paragraph [ref=e332]: Catholic funerals can still be arranged for non-practicing Catholics. Consult with your parish priest for guidance on specific circumstances.
          - generic [ref=e333]:
            - heading "Do we have to have a Vigil?" [level=3] [ref=e334]
            - paragraph [ref=e335]: While not strictly required, the Vigil is highly recommended as it provides an important opportunity for prayer and community support.
          - generic [ref=e336]:
            - heading "What's the difference between a funeral Mass and a funeral service?" [level=3] [ref=e337]
            - paragraph [ref=e338]: A funeral Mass includes the celebration of the Eucharist, while a funeral service includes prayers, readings, and a homily but no Eucharist. Both are valid Catholic funeral rites.
    - generic [ref=e339]:
      - generic [ref=e340]:
        - heading "Contact & Parish Information" [level=2] [ref=e341]
        - button "✏️ Customize" [ref=e342]
      - generic [ref=e343]:
        - paragraph [ref=e345]: For specific guidance on Catholic funeral planning, please contact your local parish priest or funeral coordinator.
        - generic [ref=e346]:
          - generic [ref=e347]:
            - generic [ref=e348]:
              - text: Contact Description
              - textbox [ref=e349]: For specific guidance on Catholic funeral planning, please contact your local parish priest or funeral coordinator.
            - generic [ref=e350]:
              - text: Phone Number
              - textbox "+27 12 345 6789" [ref=e351]
            - generic [ref=e352]:
              - text: Email Address
              - textbox "info@example.com" [ref=e353]
            - generic [ref=e354]:
              - text: Office Hours
              - 'textbox "Monday-Friday: 8:00 AM - 5:00 PM" [ref=e355]'
            - generic [ref=e356]:
              - text: Address
              - textbox "123 Church Street, City, Province, Postal Code" [ref=e357]
          - generic [ref=e358]:
            - button "Cancel" [ref=e359]
            - button "Save Changes" [ref=e360]
  - generic [ref=e363]:
    - heading [level=3]
    - button "×" [ref=e364]
  - generic [ref=e367]:
    - heading [level=3]
    - generic [ref=e368]:
      - button "Generate PDF" [ref=e369]
      - button "×" [ref=e370]
  - contentinfo [ref=e371]:
    - generic [ref=e372]:
      - generic [ref=e373]: Catholic Funeral Planning Guide
      - generic [ref=e374]:
        - text: Powered by
        - link "FuneralPlanningCatholic" [ref=e375] [cursor=pointer]:
          - /url: https://github.com/jddcef/FuneralPlanningCatholic
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('page loads with core sections visible', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   await expect(page.getByRole('heading', { name: 'Catholic Funeral Planner' })).toBeVisible();
  7  |   await expect(page.locator('#planning')).toContainText('Planning Tools');
  8  |   await expect(page.locator('#downloads')).toContainText('Downloads');
  9  |   await expect(page.locator('#faq')).toContainText('Frequently Asked Questions');
  10 | });
  11 | 
  12 | test('selecting a hymn and reading persists to localStorage', async ({ page }) => {
  13 |   await page.goto('/');
  14 | 
  15 |   const hymnCheckbox = page.locator('input[name="hymn"]').first();
> 16 |   await hymnCheckbox.check();
     |                      ^ Error: locator.check: Test timeout of 30000ms exceeded.
  17 | 
  18 |   const readingRadio = page.locator('input[name^="reading-"]').first();
  19 |   await readingRadio.check();
  20 | 
  21 |   const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('funeral-planner-v1')));
  22 |   expect(stored).toBeTruthy();
  23 |   expect(stored.hymns.length).toBeGreaterThan(0);
  24 |   expect(Object.keys(stored.readings).length).toBeGreaterThan(0);
  25 | });
  26 | 
  27 | test('theme filter narrows visible readings', async ({ page }) => {
  28 |   await page.goto('/');
  29 | 
  30 |   const themeFilter = page.locator('#theme-filter');
  31 |   await themeFilter.selectOption({ label: 'Hope' });
  32 | 
  33 |   const visibleReadings = page.locator('.reading-group .font-medium');
  34 |   await expect(visibleReadings.first()).toBeVisible();
  35 | 
  36 |   const texts = await visibleReadings.allTextContents();
  37 |   expect(texts.some(text => text.toLowerCase().includes('hope') || text.toLowerCase().includes('wisdom') || text.toLowerCase().includes('job'))).toBeTruthy();
  38 | });
  39 | 
```