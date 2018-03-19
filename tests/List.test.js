import 'jsdom-global/register';
import test from 'ava';
import React from 'react';
import Enzyme from 'enzyme';
import { mount } from 'enzyme';
import List from '../src/components/List.jsx';
import Adapter from 'enzyme-adapter-react-13';

Enzyme.configure({ adapter: new Adapter() });


test('should display branch name', t => {
  const branch = { name: 'develop', _links: { html: 'http://test.com' } };
  const wrapper = mount(<List branch={branch} />);

  t.is(wrapper.text().trim(), branch.name);
});
