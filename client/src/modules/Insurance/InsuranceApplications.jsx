import { useState } from "react";
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Tabs,
  Alert,
  AmountInput,
} from "../../components";
import FloatField from "../../components/ui/FancyInput/FloatField";
import ModuleHeader from "../../components/ui/ModuleHeader";
import toast from "react-hot-toast";
import { useDeviceSize } from "../../context/DeviceSizeContext";

function Section({ title, subtitle, children }) {
  return (
    <div className="pv-card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {subtitle && (
          <p style={{ margin: "4px 0 0", color: "var(--pv-dim)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="pv-col" style={{ gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function useFormSubmit(label) {
  return (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    // In real app, send `data` to backend/CRM here
    console.log(`${label} form submit`, data);
    toast.success(`${label} application received!`);
  };
}

/* -------------------- 1. HEALTH INSURANCE -------------------- */

function HealthInsuranceForm() {
  const handleSubmit = useFormSubmit("Health Insurance");

  return (
    <form className="pv-col" style={{ gap: 16 }} onSubmit={handleSubmit}>
      <Alert type="info" title="Your data is protected">
        We ask for health info only to suggest suitable plans. It’s never shared
        without your consent.
      </Alert>

      <Section title="Proposer Details">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <FloatField
            label="Full Name"
            name="proposerName"
            required
          />
          <FloatField
            label="Mobile Number"
            name="mobile"
            required
          />
          <FloatField
            label="Email"
            name="email"
            type="email"
          />
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            required
          />
          <Select label="Gender" name="gender" required>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="na">Prefer not to say</option>
          </Select>
          <Select label="Marital Status" name="maritalStatus">
            <option value="">Select…</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input label="City" name="city" placeholder="City" />
          <Select label="State" name="state">
            <option value="">Select state…</option>
            <option value="MH">Maharashtra</option>
            <option value="DL">Delhi</option>
            <option value="KA">Karnataka</option>
            <option value="TN">Tamil Nadu</option>
            {/* add full list later */}
          </Select>
          <Input label="Pincode" name="pincode" placeholder="e.g., 400001" />
        </div>
      </Section>

      <Section
        title="Who Do You Want to Cover?"
        subtitle="This helps us understand how many people need coverage."
      >
        <RadioGroup
          name="coverageType"
          label="Coverage Type"
          options={[
            { label: "Self", value: "self" },
            { label: "Self + Spouse", value: "self_spouse" },
            { label: "Family (Self, Spouse, Kids)", value: "family" },
            { label: "Parents", value: "parents" },
            { label: "Self + Family + Parents", value: "family_parents" },
          ]}
          defaultValue="family"
        />

        <Textarea
          label="Family Details"
          name="familyDetails"
          placeholder="Example: Self (32 yrs), Spouse (30 yrs), Son (4 yrs), Father (60 yrs)…"
          rows={3}
        />
      </Section>

      <Section
        title="Health & Lifestyle"
        subtitle="Basic information to estimate eligibility and premiums."
      >
        <RadioGroup
          name="smoker"
          label="Do you or any family member smoke or use tobacco?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <RadioGroup
          name="existingIllness"
          label="Any existing major illness?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <Textarea
          label="If yes, share brief details"
          name="existingIllnessDetails"
          placeholder="E.g., Father – Diabetes since 2015, Mother – Hypertension…"
          rows={3}
        />

        <RadioGroup
          name="hospitalization"
          label="Hospitalization in last 5 years?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <Textarea
          label="Hospitalization details (if any)"
          name="hospitalizationDetails"
          placeholder="Reason, year, duration of stay…"
          rows={3}
        />
      </Section>

      <Section title="Coverage Preferences">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Select label="Sum Insured (₹)" name="sumInsured" required>
            <option value="">Select…</option>
            <option value="300000">₹3,00,000</option>
            <option value="500000">₹5,00,000</option>
            <option value="1000000">₹10,00,000</option>
            <option value="2000000">₹20,00,000</option>
          </Select>
          <Select label="Policy Type" name="policyType">
            <option value="family_floater">Family Floater</option>
            <option value="individual">Individual</option>
          </Select>
          <Select label="Policy Term" name="policyTerm">
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
          </Select>
        </div>

        <div className="pv-row" style={{ gap: 16, flexWrap: "wrap" }}>
          <Checkbox label="Need maternity coverage" name="maternity" />
          <Checkbox label="Need parents to be covered" name="parentsCover" />
          <Checkbox label="Okay with waiting period for some illnesses" name="waitingOk" />
        </div>
      </Section>

      <Section title="Existing Health Policy (If Any)">
        <RadioGroup
          name="hasExistingPolicy"
          label="Do you or your family have existing health insurance?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input label="Current Insurer" name="currentInsurer" />
          <Input label="Policy Expiry Date" name="policyExpiry" type="date" />
          <Select label="Any claim in last 3 years?" name="claims3Years">
            <option value="">Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </div>
        <Textarea
          label="Any claim details (optional)"
          name="claimDetails"
          rows={3}
        />
      </Section>

      <div
        className="pv-row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Checkbox
          name="consent"
          required
          label="I confirm the above details are true and I agree to be contacted by Paisavidhya."
        />
        <Button type="submit">Get Health Insurance Quotes</Button>
      </div>
    </form>
  );
}

/* -------------------- 2. LIFE INSURANCE -------------------- */

function LifeInsuranceForm() {
  const handleSubmit = useFormSubmit("Life Insurance");

  return (
    <form className="pv-col" style={{ gap: 16 }} onSubmit={handleSubmit}>
      <Alert type="info" title="Protect your family's lifestyle">
        Life insurance planning is based on your income, liabilities and goals.
      </Alert>

      <Section title="Personal & Contact Details">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <FloatField
            label="Full Name"
            name="fullName"
            required
          />
          <FloatField
            label="Mobile Number"
            name="mobile"
            required
          />
          <FloatField
            label="Email"
            name="email"
            type="email"
          />
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            required
          />
          <Select label="Gender" name="gender">
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="na">Prefer not to say</option>
          </Select>
          <Select label="Employment Type" name="employmentType">
            <option value="">Select…</option>
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self-employed</option>
            <option value="business">Business Owner</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <AmountInput
            label="Monthly Income (₹)"
            name="monthlyIncome"
          />
          <Input label="PAN (optional)" name="pan" placeholder="ABCDE1234F" />
        </div>
      </Section>

      <Section title="Coverage Preferences">
        <RadioGroup
          name="planType"
          label="What type of plan are you looking for?"
          options={[
            { label: "Term Plan (pure protection)", value: "term" },
            { label: "Savings / Endowment", value: "savings" },
            { label: "Child Plan", value: "child" },
            { label: "Retirement / Pension", value: "retirement" },
          ]}
          defaultValue="term"
        />

        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <AmountInput
            label="Desired Cover (Sum Assured ₹)"
            name="sumAssured"
          />
          <Select label="Policy Term" name="policyTerm">
            <option value="">Select…</option>
            <option value="20">20 years</option>
            <option value="25">25 years</option>
            <option value="30">30 years</option>
            <option value="to60">Till age 60</option>
            <option value="to70">Till age 70</option>
          </Select>
          <Select label="Premium Frequency" name="premiumFrequency">
            <option value="yearly">Yearly</option>
            <option value="half-yearly">Half-yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>

        <AmountInput
          label="Approx budget for premium per month (₹)"
          name="premiumBudget"
        />
      </Section>

      <Section title="Health & Lifestyle">
        <RadioGroup
          name="smoker"
          label="Do you smoke or use tobacco?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <RadioGroup
          name="alcohol"
          label="Alcohol consumption"
          options={[
            { label: "Never", value: "never" },
            { label: "Occasionally", value: "occasionally" },
            { label: "Regularly", value: "regularly" },
          ]}
          defaultValue="occasionally"
        />
        <RadioGroup
          name="criticalIllness"
          label="Any history of critical illness (heart, cancer, stroke, etc.)?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <Textarea
          label="If yes, please share brief details"
          name="criticalIllnessDetails"
          rows={3}
        />
      </Section>

      <Section title="Nominee Details">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <FloatField label="Nominee Name" name="nomineeName" required />
          <Select label="Relationship to you" name="nomineeRelationship">
            <option value="">Select…</option>
            <option value="spouse">Spouse</option>
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Nominee Age"
            name="nomineeAge"
            type="number"
            min={1}
          />
        </div>
        <Input
          label="Nominee Mobile (optional)"
          name="nomineeMobile"
        />
      </Section>

      <Section title="Existing Life Insurance">
        <RadioGroup
          name="hasExistingLife"
          label="Do you already have life insurance?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <Textarea
          label="Details of existing policies (insurer & cover amount)"
          name="existingPolicies"
          rows={3}
        />
      </Section>

      <div
        className="pv-row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Checkbox
          name="consent"
          required
          label="I confirm the above details are accurate and I consent to being contacted for life insurance planning."
        />
        <Button type="submit">Get Life Insurance Options</Button>
      </div>
    </form>
  );
}

/* -------------------- 3. MOTOR & GENERAL -------------------- */

function MotorGeneralInsuranceForm() {
  const handleSubmit = useFormSubmit("Motor & General Insurance");

  return (
    <form className="pv-col" style={{ gap: 16 }} onSubmit={handleSubmit}>
      <Alert type="info" title="Protect your assets">
        Get coverage for your vehicle, home, travel or property with transparent
        pricing.
      </Alert>

      <Section title="What Do You Want to Insure?">
        <RadioGroup
          name="productType"
          label="Select category"
          options={[
            { label: "Car", value: "car" },
            { label: "Bike", value: "bike" },
            { label: "Commercial Vehicle", value: "commercial" },
            { label: "Home", value: "home" },
            { label: "Travel", value: "travel" },
            { label: "Other Property", value: "property" },
          ]}
          defaultValue="car"
        />
      </Section>

      <Section title="Basic Contact Details">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <FloatField
            label="Full Name"
            name="fullName"
            required
          />
          <FloatField
            label="Mobile Number"
            name="mobile"
            required
          />
          <FloatField
            label="Email"
            name="email"
            type="email"
          />
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input label="City" name="city" />
          <Select label="State" name="state">
            <option value="">Select state…</option>
            <option value="MH">Maharashtra</option>
            <option value="DL">Delhi</option>
            <option value="KA">Karnataka</option>
            <option value="TN">Tamil Nadu</option>
          </Select>
        </div>
      </Section>

      <Section title="Vehicle / Property Details">
        <Textarea
          label="Share details"
          name="assetDetails"
          placeholder="For vehicle: Car/Bike, Make, Model, Fuel type, Year, Registration number, RTO… 
For home/property: Apartment/house, Location, Built-up area, Approx value…
For travel: Destination, dates, number of travellers…"
          rows={4}
        />
      </Section>

      <Section title="Coverage Preferences">
        <Select label="Type of cover" name="coverageType">
          <option value="">Select…</option>
          <option value="comprehensive_vehicle">
            Comprehensive (vehicle)
          </option>
          <option value="third_party">Third Party Only</option>
          <option value="home_building_contents">
            Home – Building + Contents
          </option>
          <option value="travel_medical">Travel + Medical coverage</option>
        </Select>

        <AmountInput
          label="Approx value of vehicle / property / trip (₹)"
          name="assetValue"
        />

        <Textarea
          label="Any add-ons / specific requirements?"
          name="addons"
          placeholder="E.g., Zero dep, engine protector, roadside assistance, higher baggage cover, etc."
          rows={3}
        />
      </Section>

      <Section title="Existing Policy (If Any)">
        <RadioGroup
          name="hasExistingPolicy"
          label="Do you already have a policy for this?"
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          defaultValue="no"
        />
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input label="Current Insurer" name="currentInsurer" />
          <Input label="Policy Expiry Date" name="policyExpiry" type="date" />
          <Select label="Any claims in the last 1 year?" name="claimsYear">
            <option value="">Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </div>
        <Textarea
          label="Claim details (if any)"
          name="claimDetails"
          rows={3}
        />
      </Section>

      <div
        className="pv-row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Checkbox
          name="consent"
          required
          label="I confirm the above details are true and I agree to be contacted with quotes."
        />
        <Button type="submit">Get Motor / General Quotes</Button>
      </div>
    </form>
  );
}

/* -------------------- 4. GROUP INSURANCE -------------------- */

function GroupInsuranceForm() {
  const handleSubmit = useFormSubmit("Group Insurance");

  return (
    <form className="pv-col" style={{ gap: 16 }} onSubmit={handleSubmit}>
      <Alert type="info" title="For founders, HR & organisations">
        Share basic details so we can design a group plan that fits your team
        and budget.
      </Alert>

      <Section title="Organisation Details">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input
            label="Company / Organisation Name"
            name="companyName"
            required
          />
          <Input label="Industry" name="industry" placeholder="e.g., IT, FMCG" />
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input
            label="Head Office Location"
            name="location"
            placeholder="City, State"
          />
          <Input
            label="GST Number (optional)"
            name="gst"
            placeholder="22AAAAA0000A1Z5"
          />
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <Input
            label="Number of employees to cover"
            name="employeeCount"
            type="number"
            min={1}
          />
          <Select label="Company Size" name="companySize">
            <option value="">Select…</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="200+">200+</option>
          </Select>
        </div>
      </Section>

      <Section title="Contact Person">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <FloatField
            label="Contact Person Name"
            name="contactName"
            required
          />
          <Input
            label="Designation"
            name="designation"
            placeholder="e.g., HR Manager, Founder"
          />
        </div>
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <FloatField
            label="Mobile Number"
            name="mobile"
            required
          />
          <FloatField
            label="Work Email"
            name="email"
            type="email"
            required
          />
        </div>
      </Section>

      <Section title="Type of Group Coverage">
        <Checkbox
          name="groupHealth"
          label="Group Health Insurance"
        />
        <Checkbox
          name="groupTerm"
          label="Group Term Life"
        />
        <Checkbox
          name="personalAccident"
          label="Personal Accident Cover"
        />
        <Checkbox
          name="wellnessBenefits"
          label="Wellness / OPD benefits"
        />
        <Textarea
          label="Any specific requirements?"
          name="specialRequirements"
          rows={3}
        />
      </Section>

      <Section title="Coverage & Budget">
        <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <AmountInput
            label="Typical Sum Insured per employee (₹)"
            name="sumInsuredPerEmployee"
          />
          <AmountInput
            label="Approx annual budget for group premium (₹)"
            name="annualBudget"
          />
        </div>

        <Input
          label="Expected policy start date"
          name="policyStart"
          type="date"
        />

        <Textarea
          label="Existing group policy details (if any)"
          name="existingPolicyDetails"
          placeholder="Current insurer, sum insured, premium, major inclusions/exclusions…"
          rows={3}
        />
      </Section>

      <div
        className="pv-row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Checkbox
          name="consent"
          required
          label="I am authorised to share these details on behalf of the organisation and consent to be contacted."
        />
        <Button type="submit">Request Group Insurance Proposal</Button>
      </div>
    </form>
  );
}

/* -------------------- MAIN WRAPPER -------------------- */

export default function InsuranceApplications() {
  const { isMobile } = useDeviceSize();
  const [defaultIndex] = useState(0);

  const tabs = [
    {
      label: isMobile ? "Health" : "Health Insurance",
      content: <HealthInsuranceForm />,
    },
    {
     label: isMobile ? "Life" : "Life Insurance",
      content: <LifeInsuranceForm />,
    },
    {
      label: "Motor & General",
      content: <MotorGeneralInsuranceForm />,
    },
    {
      label: "Group Insurance",
      content: <GroupInsuranceForm />,
    },
  ];

  return (
    <div className="pv-container" style={{ maxWidth: 980, margin: "0 auto", padding: "16px 0 32px" }}>
      <ModuleHeader
        title="Insurance Applications"
        subtitle="Collect accurate, compliant details to suggest the right coverage."
        brdcrumbs={[
          { label: "Home", to: "/" },
          { label: "Insurance", to: "/insurance" },
          { label: "Applications" },
        ]}
        sticky={false}
        compact
      />

      <Card title="Choose Insurance Type" style={{ marginTop: 16 }}>
        <Tabs tabs={tabs} defaultIndex={defaultIndex} />
      </Card>
    </div>
  );
}
