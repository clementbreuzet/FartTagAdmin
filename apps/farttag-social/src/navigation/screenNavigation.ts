import type { NavigationProp } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export type SectionScreenNavigation = Pick<
  NavigationProp<RootStackParamList>,
  'goBack' | 'navigate'
>;
