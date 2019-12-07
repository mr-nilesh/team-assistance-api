export  default
{
  describe: 'suite',
  it: 'scenario',
  splitBy: {
    main: '->',
    uiInteraction: '=',
  },
  by: {
    id: 'id',
    css: 'css',
    model: 'model',
    name: 'name',
    xpath: 'xpath',
    tagName: 'tag',
    linkText: 'link',
    className: 'class',
    buttonText: 'buttonText',
    options: 'options',
    repeater: 'repeater',
  },
  interactions: {
    sendKeys: 'input',
    click: 'click',
    clear: 'clearInput',
    isPresent: 'isPresent',
    getTagName: 'getTagName',
    getText: 'getText',
    getSize: 'getSize',
    getLocation: 'getLocation',
    isEnabled: 'isEnabled',
    submit: 'submit',
    isDisplayed: 'isDisplayed',
    takeScreenshot: 'takeScreenshot',
  },
  pause: 'pause',
  assertions: {
    equal: 'equal',
    shouldBeEnabled: 'shouldBeEnabled',
    shouldBeDisabled: 'shouldBeDisabled',
  }
};
