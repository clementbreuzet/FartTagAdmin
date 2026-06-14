import React from 'react';

import type { SectionScreenNavigation } from '../../../navigation/screenNavigation';
import { FartHistoryScreen } from '../../history/FartHistoryScreen';

type ProfileHistoryTabProps = {
  navigation: SectionScreenNavigation;
};

export const ProfileHistoryTab = ({ navigation }: ProfileHistoryTabProps) => (
  <FartHistoryScreen navigation={navigation} />
);

export default ProfileHistoryTab;
