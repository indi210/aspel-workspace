import React, { Fragment } from 'react';
import { connect, useSelector } from 'react-redux';
import {
  ControlBar,
  FormLayout,
  Header,
  Link,
  Snippet
} from '@ukhomeoffice/asl-components';
import { Warning } from '@ukhomeoffice/react-components';
import namedRoles from '../../content/named-roles';
import { format } from 'date-fns';
import { dateFormat } from '../../../../constants';

const checkExemptionDelay = (mandatoryTraining) => {
  const isExemption = Array.isArray(mandatoryTraining)
    ? mandatoryTraining.includes('exemption')
    : mandatoryTraining === 'exemption';
  const isDelay = Array.isArray(mandatoryTraining)
    ? mandatoryTraining.includes('delay')
    : mandatoryTraining === 'delay';

  return { isExemption, isDelay };
};

const ExemptionRequest = () => {
  return (
    <p>
      <dt><Snippet>explanation.exemptionRequest</Snippet></dt>
    </p>
  );
};

const NVSRole = ({ nvs, incompleteTraining, mandatoryTraining }) => {
  const { isExemption, isDelay } = checkExemptionDelay(mandatoryTraining);
  return (
    <>
      {nvs.rcvsNumber && (
        <>
          <dt><Snippet>explanation.nvs.rcvsNumber</Snippet></dt>
          <dd>{nvs.rcvsNumber}</dd>
        </>
      )}

      {isExemption && <ExemptionRequest /> }

      {isDelay && (
        <>
          <dt><Snippet>explanation.nvs.trainingNotComplete</Snippet></dt>
          <dd />
          <dt><Snippet>explanation.nvs.reasonForDelay</Snippet></dt>
          <dd>{incompleteTraining.delayReason}</dd>
          <dt><Snippet>explanation.nvs.completionDate</Snippet></dt>
          <dd>{format(incompleteTraining.completeDate, dateFormat.long)}</dd>
        </>
      )}
    </>
  );
};

const NACWORole = ({ incompleteTraining, mandatoryTraining }) => {
  const { isExemption, isDelay } = checkExemptionDelay(mandatoryTraining);
  const incompleteModules = [].concat(incompleteTraining.incomplete || []).join(', ');

  return (
    <>
      {isExemption && <ExemptionRequest /> }

      {isDelay && (
        <>
          <dt><Snippet>explanation.nacwo.delay</Snippet></dt>
          <dd />
          <dt><Snippet>explanation.nacwo.trainingToComplete</Snippet></dt>
          <dd>{incompleteModules}</dd>
          <dt><Snippet>explanation.nacwo.reasonForDelay</Snippet></dt>
          <dd>{incompleteTraining.delayReason}</dd>
          <dt><Snippet>explanation.nacwo.trainingDate</Snippet></dt>
          <dd>{format(incompleteTraining.completeDate, dateFormat.long)}</dd>
        </>
      )}
    </>
  );
};

const Confirm = ({
  establishment,
  profile,
  profileReplaced,
  values,
  children,
  ...props
}) => {
  const formatters = {
    declaration: {
      propMappers: {
        label: (_, formatter) => <Snippet {...formatter.renderContext ?? {}}>agreement</Snippet>,
        title: () => <Snippet>fields.declaration.title</Snippet>,
        hint: () => <Snippet fallback='declarations.default'>declarations.{values.type}</Snippet>
      },
      renderContext: {
        agreementDeterminer: ['nacwo', 'nvs'].includes(values.type) ? 'all' : 'both'
      }
    }
  };

  const { incompleteTraining = {}, mandatoryTraining } = useSelector(state => state.static);

  // Determine the edit path based on action
  const editPath = props.action === 'remove' ? 'delete' : 'create';

  return (
    <FormLayout formatters={formatters}>
      <span className="govuk-caption-l">{`${profile.firstName} ${profile.lastName}`}</span>
      <Header title={<Snippet>confirmTitle</Snippet>}/>
      <dl>
        <dt><Snippet>applyingFor</Snippet></dt>
        <dd>{namedRoles[values.type]}</dd>

        <dt><Snippet>onBehalfOf</Snippet></dt>
        <dd>
          {`${profile.firstName} ${profile.lastName}`}
          { profileReplaced && props.action !== 'remove' &&
            <Warning>The existing {profileReplaced.type.toUpperCase()} {profileReplaced.firstName} {profileReplaced.lastName} will be removed from the role when this request is approved.</Warning>
          }
        </dd>

        { values.type === 'nvs' && <NVSRole nvs={values} incompleteTraining={incompleteTraining} mandatoryTraining={mandatoryTraining} /> }
        { values.type === 'nacwo' && <NACWORole incompleteTraining={incompleteTraining} mandatoryTraining={mandatoryTraining} /> }
        { mandatoryTraining === 'yes' && (
          <>
            <dt><Snippet>explanation.trainingComplete</Snippet></dt>
          </>
        ) }
      </dl>

      {
        props.action === 'remove' && values.type === 'nacwo' &&
          <Warning><Snippet>nacwoWarning</Snippet></Warning>
      }

      <ControlBar>
        <Link page={`role.namedPersonMvp.${editPath}`} label={<Snippet>buttons.edit</Snippet>} />
        <Link page="profile.read" label={<Snippet>buttons.cancel</Snippet>} />
      </ControlBar>
    </FormLayout>
  );
};

const mapStateToProps = ({
  static: {
    establishment,
    profile,
    profileReplaced,
    values,
    ...rest
  }
}) => ({
  establishment,
  profile,
  profileReplaced,
  values,
  rest
});

export default connect(mapStateToProps)(Confirm);
