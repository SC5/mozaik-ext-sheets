jest.dontMock('./../components/List.jsx');
jest.setMock('mozaik/browser', {
  Mixin: {
    ApiConsumer: null
  }
});

var List, view;

describe('Events — List', function () {

  beforeEach(function () {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    List = require('./../components/List.jsx');
  });

  it('should return correct api request', function () {
    view = TestUtils.renderIntoDocument(<List documentId="123" />);
    console.log(view.state, 'state');
    expect('foo').toEqual('foo');
  });

});

