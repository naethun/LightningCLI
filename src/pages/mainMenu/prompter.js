async function prompter(menu) {
    console.log(menu)
    await menu.showPage()
    let decision = await menu.prompt()
    return decision
}

module.exports = prompter;