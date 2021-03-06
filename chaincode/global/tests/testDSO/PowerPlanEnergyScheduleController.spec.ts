/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {
  bspOrganization,
  bspOrganizationType,
  dsoOrganization,
  dsoOrganizationType,
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {initAndGetMockStub} from '../common/InitChaincode';
import {PowerPlanEnergyScheduleHelper} from '../helper/PowerPlanEnergySchedule.helper';
import {PowerPlanEnergyScheduleMockTransaction} from '../mockControllers/PowerPlanEnergyScheduleMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';
import {PowerPlanEnergySchedule} from '../../src/powerPlanEnergySchedule/PowerPlanEnergySchedule';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';

let mockStub: ChaincodeMockStub;
const powerPlanEnergySchedule = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  '1',
  'edpRegisteredResourceId'
);
const powerPlanEnergySchedule2 = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  '1',
  'edpRegisteredResourceId2'
);
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');
const edp2: EDP = new EDPHelper().createEdp(
  'edpRegisteredResourceId2',
  'siteId2'
);
const mvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.MV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const mvSite2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.MV,
  'ID_EDA2',
  otherDSOOrganization.organizationId
);
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  bspOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should not be able to create a new powerPlanEnergySchedule.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(
      powerPlanEnergySchedule,
      dsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create a PowerPlanEnergySchedule.'
    );
  });

  it('I should be able to get a powerPlanEnergySchedule by Id when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<PowerPlanEnergySchedule> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).getPowerPlanEnergySchedule(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify(powerPlanEnergySchedule)
    );
  });

  it('I should not be able to get a powerPlanEnergySchedule by Id when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule2, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<PowerPlanEnergySchedule> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).getPowerPlanEnergySchedule(
      powerPlanEnergySchedule2.powerPlanEnergyScheduleId,
      dsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get this PowerPlanEnergySchedule.'
    );
  });
});
