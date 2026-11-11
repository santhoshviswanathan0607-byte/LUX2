
import { test, expect } from '@playwright/test';

test('Unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/people');

  // The app redirects unauthenticated users to signin
  await expect(page).toHaveURL(/signin/);

  // Verify that the login heading is visible
  await expect(
    page.getByRole('heading', { name: 'Log in to your account' })
  ).toBeVisible();
});

test('Should display login form elements', async ({ page }) => {
  await page.goto('/signin');

  // Verify email field
  await expect(page.locator('#auth-email')).toBeVisible();

  // Verify password field
  await expect(page.locator('#auth-password')).toBeVisible();

  // Verify Login button
  await expect(
    page.locator('#auth-signin-submit-btn')
  ).toBeVisible();
});

test('Should show validation errors for empty login fields', async ({ page }) => {
  await page.goto('/signin');

  // Click Login without entering credentials
  await page.locator('#auth-signin-submit-btn').click();

  // Verify the email validation error
  await expect(
    page.locator('#auth-email').locator('..').locator('..')
  ).toContainText(/required/i);

  // Verify the password validation error
  await expect(
    page.locator('#auth-password').locator('..').locator('..')
  ).toContainText(/required/i);
});

test('Should show an error for invalid login credentials', async ({ page }) => {
  await page.goto('/signin');

  // Enter invalid email and password
  await page.locator('#auth-email').fill('wronguser@example.com');
  await page.locator('#auth-password').fill('WrongPassword123');

  // Click Login
  await page.locator('#auth-signin-submit-btn').click();

  // Verify that an error message appears
  await expect(page.getByRole('alert')).toBeVisible();
});


test('Should display the People module correctly', async ({ page }) => {
  const email = process.env.NEXUS_EMAIL;
  const password = process.env.NEXUS_PASSWORD;

  // Credentials are required to test the protected People page
  test.skip(!email || !password, 'Set NEXUS_EMAIL and NEXUS_PASSWORD first');

  // Step 1: Open the sign-in page
  await page.goto('/signin');

  // Step 2: Enter login credentials
  await page.getByLabel('Registered Email').fill(email);
  await page.locator('#auth-password').fill(password);

  // Step 3: Submit the login form
  await page.getByRole('button', { name: 'Log in' }).click();

  // Step 4: Waiting for successful authentication
 await expect(page).not.toHaveURL(/signin/);
  // Step 5: Open the People module
  await page.goto('/people');

  // Step 6: Verify the People page heading
  await expect(
    page.getByRole('heading', { name: 'People & Teams' })
  ).toBeVisible();

  // Step 7: Verify the module sections
  await expect(page.getByText('Members', { exact: true })).toBeVisible();
  await expect(page.getByText('Teams & Squads', { exact: true })).toBeVisible();
  await expect(page.getByText('Invitations', { exact: true })).toBeVisible();
});
async function loginAndOpenPeople(page) {
  const email = process.env.NEXUS_EMAIL;
  const password = process.env.NEXUS_PASSWORD;

  test.skip(!email || !password, 'Set NEXUS_EMAIL and NEXUS_PASSWORD first');

  await page.goto('/signin');
  await page.getByLabel('Registered Email').fill(email);
  await page.locator('#auth-password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).not.toHaveURL(/signin/);
  await page.goto('/people');

  await expect(
    page.getByRole('heading', { name: 'People & Teams' })
  ).toBeVisible();
}


test('People: should allow searching colleagues', async ({ page }) => {
  await loginAndOpenPeople(page);

  const search = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await expect(search).toBeVisible();

  // Enter a search term
  await search.fill('test colleague');

  // Verify the search field accepts the value
  await expect(search).toHaveValue('test colleague');

  // Clear the search
  await search.clear();

  await expect(search).toHaveValue('');
});

test('People: should open the Teams & Squads tab', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', {
  name: /Teams & Squads \(\d+\)/
}).click();

  await expect(
    page.getByRole('button', { name: 'Create Team' })
  ).toBeVisible();
});

test('People: should open the Pending Invites tab', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Pending Invites/ }).click();

  await expect(
    page.getByText('Pending Team Invitations', { exact: true })
  ).toBeVisible();
});

test('People: should open and close the invitation form', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Invite Person' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).not.toBeVisible();
});



test('People: should display role filter options', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.getByRole('combobox').filter({ visible: true });

  await expect(roleFilter.first()).toBeVisible();
});



test('People: should show all role filter options', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.locator('select').filter({
    hasText: 'All Roles',
  });

  await expect(roleFilter).toBeVisible();

  await expect(
    roleFilter.locator('option', { hasText: 'All Roles' })
  ).toHaveCount(1);

  await expect(
    roleFilter.locator('option', { hasText: 'Admin' })
  ).toHaveCount(1);

  await expect(
    roleFilter.locator('option', { hasText: 'Team Lead' })
  ).toHaveCount(1);

  await expect(
    roleFilter.locator('option', { hasText: 'Member' })
  ).toHaveCount(1);
});


test('People: should select a role filter', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.locator('select.people-filter-select').filter({
    has: page.locator('option', { hasText: 'All Roles' }),
  });

  await expect(roleFilter).toBeVisible();

  // Select the option using its actual HTML value
  await roleFilter.selectOption('admin');

  // Verify the selected value
  await expect(roleFilter).toHaveValue('admin');
});


test('People: should display the department filter', async ({ page }) => {
  await loginAndOpenPeople(page);

  const departmentFilter = page.locator('select.people-filter-select').nth(1);

  await expect(departmentFilter).toBeVisible();
  await expect(departmentFilter.locator('option').first()).toBeAttached();
});

test('People: should switch between grid and table views', async ({ page }) => {
  await loginAndOpenPeople(page);

  const tableViewButton = page.getByTitle('Table List View');
  const gridViewButton = page.getByTitle('Grid Cards View');

  await expect(tableViewButton).toBeVisible();
  await expect(gridViewButton).toBeVisible();

  await tableViewButton.click();
  await expect(gridViewButton).toBeVisible();

  await gridViewButton.click();
  await expect(tableViewButton).toBeVisible();
});

test('People: should open and close member details', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').first();

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  // Verify member details are displayed
  await expect(page.getByText('Assigned Squad / Team')).toBeVisible();
  await expect(page.getByText('Member Since')).toBeVisible();

  // Close the member details
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByText('Assigned Squad / Team')).not.toBeVisible();
});

test('People: should display key member detail fields', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').first();

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(page.getByText('Email', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Department', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('Location', { exact: true })).toBeVisible();
  await expect(page.getByText('Member Since', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
});

test('People: should display invitation form fields', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Invite Person' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).toBeVisible();

  await expect(
  page.getByPlaceholder('colleague@nexusapp.io')
).toBeVisible();
  await expect(page.getByText('Workspace Role')).toBeVisible();
  await expect(page.getByText('Department / Function')).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('People: should reject an invalid invitation email', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Invite Person' }).click();

  const emailInput = page.getByPlaceholder('colleague@nexusapp.io');

  await emailInput.fill('invalid-email');

  await expect(emailInput).toHaveAttribute('type', 'email');

  const isValid = await emailInput.evaluate(
    element => element.validity.valid
  );

  expect(isValid).toBe(false);

  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('People: should filter members by Admin role', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.locator('select.people-filter-select').nth(0);

  await roleFilter.selectOption('admin');

  await expect(roleFilter).toHaveValue('admin');

  const memberCards = page.locator('.member-card');

  for (const card of await memberCards.all()) {
    await expect(card.locator('.role-badge')).toHaveText('Admin');
  }
});



test('People: should search team members', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await expect(searchInput).toBeVisible();

  await searchInput.fill('nonexistent-member-123');

  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();
});


test('People: should close invitation form when Cancel is clicked', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Invite Person' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).not.toBeVisible();
});


test('People: should display Pending Invites tab', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Pending Invites/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Pending Team Invitations' })
  ).toBeVisible();
});


test('People: should display empty pending invitations message', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Pending Invites/ }).click();

  await expect(
    page.getByText('No pending invitations. All invited members have joined!')
  ).toBeVisible();
});



test('People: should refresh the directory', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByTitle('Refresh directory').click();

  await expect(
    page.getByRole('heading', { name: 'People & Teams' })
  ).toBeVisible();
});

test('People: should open Create Team form', async ({ page }) => {
  await loginAndOpenPeople(page);

await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  await expect(
    page.getByPlaceholder('e.g. Mobile Engineering, Growth Squad')
  ).toBeVisible();
});



test('People: should cancel Create Team form', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();

  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).not.toBeVisible();
});



test('People: should require a team name', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  const teamName = page.getByPlaceholder(
    'e.g. Mobile Engineering, Growth Squad'
  );

  await expect(teamName).toHaveAttribute('required', '');

  const isValid = await teamName.evaluate(
    (element) => element.validity.valid
  );

  expect(isValid).toBe(false);

  await page.getByRole('button', { name: 'Cancel' }).click();
});




test('People: should create a team with a valid name', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  const teamName = `Automation Team ${Date.now()}`;

  await page.getByPlaceholder(
    'e.g. Mobile Engineering, Growth Squad'
  ).fill(teamName);

  await page.getByRole('button', { name: 'Create Team', exact: true })
    .last()
    .click();

  await expect(page.getByRole('heading', { name: 'Create New Team / Squad' }))
    .toBeHidden();

  await expect(page.getByText(teamName, { exact: true })).toBeVisible();
});




test('People: should accept a team description', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  const description = page.getByPlaceholder(
    'What does this squad focus on?'
  );

  await description.fill('Automated testing and quality assurance');

  await expect(description).toHaveValue(
    'Automated testing and quality assurance'
  );

  await page.getByRole('button', { name: 'Cancel' }).click();
});




test('People: should allow an empty team description', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  const description = page.getByPlaceholder(
    'What does this squad focus on?'
  );

  await expect(description).toBeVisible();
  await expect(description).toBeEmpty();

  await page.getByRole('button', { name: 'Cancel' }).click();
});




test('People: should accept a team name with spaces', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  const teamName = page.getByPlaceholder(
    'e.g. Mobile Engineering, Growth Squad'
  );

  await teamName.fill('Quality Assurance Team');

  await expect(teamName).toHaveValue('Quality Assurance Team');

  await page.getByRole('button', { name: 'Cancel' }).click();
});




test('People: should display the Team Lead field', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

const teamLead = page
  .locator('input')
  .filter({ visible: true })
  .nth(2);

await expect(teamLead).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
});



test('People: should accept comma-separated team tags', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  const tags = page.getByPlaceholder('React, Backend, Sprints');

  await tags.fill('Automation, QA, Playwright');

  await expect(tags).toHaveValue('Automation, QA, Playwright');

  await page.getByRole('button', { name: 'Cancel' }).click();
});


test('People: should send a valid invitation and display it under Pending Invites', async ({ page }) => {
  await loginAndOpenPeople(page);

  const invitedEmail = `playwright_${Date.now()}@example.com`;

  // Open invitation form
  await page.getByRole('button', { name: 'Invite Person' }).click();

  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).toBeVisible();

  // Enter invitation email
  await page.getByPlaceholder('colleague@nexusapp.io').fill(invitedEmail);

  // Send invitation
  await page.getByRole('button', { name: 'Send Invitation' }).click();

  // Verify invitation form closes
  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).not.toBeVisible();

  // Open Pending Invites
  await page.getByRole('button', { name: /Pending Invites/ }).click();

  // Verify invited email is displayed
  // Verify invited email appears in Pending Invites
await expect(
  page.getByText(invitedEmail, { exact: true })
).toBeVisible();
});




test('People: should display the created team after page refresh', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Open Teams & Squads
  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();

  // Open Create Team form
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  // Enter a unique team name
  const teamName = `Playwright QA Team ${Date.now()}`;

  await page.getByPlaceholder(
    'e.g. Mobile Engineering, Growth Squad'
  ).fill(teamName);

  // Create the team
 await page.locator('form').getByRole('button', {
  name: 'Create Team',
  exact: true
}).click();
  // Verify the created team is displayed
  await expect(page.getByText(teamName, { exact: true })).toBeVisible();

  // Refresh the page
  await page.reload();

  // Wait for People page to load
  await expect(
    page.getByRole('heading', { name: 'People & Teams' })
  ).toBeVisible();

  // Open Teams & Squads again
  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();

  // Verify team still exists after refresh
  await expect(page.getByText(teamName, { exact: true })).toBeVisible();
});



test('People: should filter members by department', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Locate department filter
  const departmentFilter = page.locator('select').filter({
    has: page.locator('option', { hasText: 'Engineering' })
  });

  await expect(departmentFilter).toBeVisible();

  // Select Engineering department
  await departmentFilter.selectOption({ label: 'Engineering' });

  // Verify the selected department
  await expect(departmentFilter).toHaveValue('Engineering');

  // Verify displayed members belong to Engineering
  const memberCards = page.locator('.member-card');

  for (const card of await memberCards.all()) {
    await expect(card).toContainText('Engineering');
  }
});

test('People: should prevent creating a team without a team name', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Open Teams & Squads
  await page.getByRole('button', { name: /Teams & Squads/ }).last().click();

  // Open Create Team form
  await page.getByRole('button', { name: /Create Team|New Team/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Team / Squad' })
  ).toBeVisible();

  // Keep the team name empty
  const teamName = page.getByPlaceholder(
    'e.g. Mobile Engineering, Growth Squad'
  );

  await expect(teamName).toHaveValue('');

  // Verify the required field prevents submission
  await expect(teamName).toHaveAttribute('required', '');

  await page.getByRole('button', { name: 'Cancel' }).click();
});


test('People: should refresh the directory successfully', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Verify Directory page is displayed
  await expect(
    page.getByRole('heading', { name: 'People & Teams' })
  ).toBeVisible();

  // Click Sync button
  await page.getByRole('button', { name: 'Sync' }).click();

  // Verify page remains available after refresh
  await expect(
    page.getByRole('heading', { name: 'People & Teams' })
  ).toBeVisible();

  
 // Verify the main Directory tab is available
await expect( page.getByRole('button', { name: /^Directory \(\d+\)$/ })).toBeVisible();
});


test('People: should close the invitation form when clicking Cancel', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Open Invite Person form
  await page.getByRole('button', { name: 'Invite Person' }).click();

  // Verify invitation form is visible
  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).toBeVisible();

  // Click Cancel
  await page.getByRole('button', { name: 'Cancel' }).click();

  // Verify invitation form is closed
  await expect(
    page.getByRole('heading', { name: 'Invite Colleague to Nexus' })
  ).not.toBeVisible();
});



test('People: should display the correct member count in Directory tab', async ({ page }) => {
  await loginAndOpenPeople(page);

  const directoryTab = page.getByRole('button', {
    name: /^Directory\s*\(\d+\)$/
  });

  await expect(directoryTab).toBeVisible();

  const tabText = await directoryTab.innerText();
  const match = tabText.match(/\((\d+)\)/);

  expect(match).not.toBeNull();

  const displayedCount = Number(match[1]);
  const actualCount = await page.locator('.member-card').count();

  expect(actualCount).toBe(displayedCount);
});



test('People: should display all members in grid view', async ({ page }) => {
  await loginAndOpenPeople(page);

  const gridViewButton = page.getByTitle('Grid Cards View');

  await gridViewButton.click();

  await expect(gridViewButton).toBeVisible();

  const memberCards = page.locator('.member-card');

  await expect(memberCards.first()).toBeVisible();

  expect(await memberCards.count()).toBeGreaterThan(0);
});




test('People: should display member records in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  const tableViewButton = page.getByTitle('Table List View');

  await tableViewButton.click();

  // Verify table view is displayed
  const table = page.locator('table');

  await expect(table).toBeVisible();

  // Verify table contains member records
  const rows = table.locator('tbody tr');

  await expect(rows.first()).toBeVisible();

  expect(await rows.count()).toBeGreaterThan(0);
});


test('People: should search members by email', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await expect(searchInput).toBeVisible();

  // Get an existing member email
  const memberEmail = await page.locator('.member-card')
    .first()
    .innerText();

  const emailMatch = memberEmail.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  expect(emailMatch).not.toBeNull();

  // Search using the member email
  await searchInput.fill(emailMatch[0]);

  // Verify matching member is displayed
  await expect(page.locator('.member-card').first())
    .toBeVisible();

  await expect(page.locator('.member-card').first())
    .toContainText(emailMatch[0]);
});



test('People: should search members by role', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');
  const noResults = page.getByRole('heading', {
    name: 'No team members match your filter'
  });

  await searchInput.clear();
  await searchInput.fill('Admin');

  // Wait until results or empty state appears
  await expect(async () => {
    const count = await memberCards.count();
    const empty = await noResults.isVisible();

    expect(count > 0 || empty).toBeTruthy();
  }).toPass();

  if (await memberCards.count() > 0) {
    for (const card of await memberCards.all()) {
      await expect(card).toContainText(/Admin/i);
    }
  } else {
    await expect(noResults).toBeVisible();
  }
});

test('People: should search members by skill', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.clear();

  const firstCard = page.locator('.member-card').first();
  await expect(firstCard).toBeVisible();

  await firstCard.click();

  // Verify member details panel
  const memberHeadings = page.getByRole('heading', {
    name: 'bharathesh'
  });

  await expect(memberHeadings.nth(1)).toBeVisible();

  // Print details to identify available fields
  console.log(await page.locator('body').innerText());
});



test('People: should search members case-insensitively', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Get an existing member name
  const firstCard = memberCards.first();
  await expect(firstCard).toBeVisible();

  const cardText = await firstCard.innerText();
  const memberName = cardText.match(/bharathesh/i);

  expect(memberName).not.toBeNull();

  // Search using lowercase
  await searchInput.fill(memberName[0].toLowerCase());

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText(/bharathesh/i);

  // Search using uppercase
  await searchInput.fill(memberName[0].toUpperCase());

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText(/bharathesh/i);
});


test('People: should restore members after clearing search', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Get initial member count
  await searchInput.clear();
  const initialCount = await memberCards.count();

  expect(initialCount).toBeGreaterThan(0);

  // Search for a name that does not exist
  await searchInput.fill('NoSuchMember123');

  const noResults = page.getByRole('heading', {
    name: 'No team members match your filter'
  });

  await expect(noResults).toBeVisible();

  // Clear search
  await searchInput.clear();

  // Verify original members are restored
  await expect(memberCards).toHaveCount(initialCount);
});





test('People: should filter members by role and department together', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const filters = page.locator('select.people-filter-select');

  const roleFilter = filters.nth(0);
  const departmentFilter = filters.nth(1);

  // Clear search
  await searchInput.clear();

  // Select Member role and Engineering department
  await roleFilter.selectOption({ label: 'Member' });
  await departmentFilter.selectOption({ label: 'Engineering' });

  const memberCards = page.locator('.member-card');

  const noResults = page.getByRole('heading', {
    name: 'No team members match your filter'
  });

  // Wait for results or empty state
  await expect(async () => {
    const count = await memberCards.count();
    const empty = await noResults.isVisible();

    expect(count > 0 || empty).toBeTruthy();
  }).toPass();

  // Validate both selected filters
  if (await memberCards.count() > 0) {
    for (const card of await memberCards.all()) {
      await expect(card).toContainText('Member');
      await expect(card).toContainText('Engineering');
    }
  } else {
    await expect(noResults).toBeVisible();
  }
});


test('PEOPLE-050: should display empty state when filters return no matching members', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.locator('select.people-filter-select').nth(0);
  const departmentFilter = page.locator('select.people-filter-select').nth(1);

  await roleFilter.selectOption({ label: 'Admin' });
  await departmentFilter.selectOption({ label: 'Engineering' });

  await expect(
    page.getByRole('heading', { name: 'No team members match your filter' })
  ).toBeVisible();
});



test('PEOPLE-051: should restore member list after clearing filters', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.locator('select.people-filter-select').nth(0);
  const departmentFilter = page.locator('select.people-filter-select').nth(1);
  const memberCards = page.locator('.member-card');

  // Wait for the initial member list
  await expect(memberCards.first()).toBeVisible();

  const initialCount = await memberCards.count();

  // Apply filters that return no matching members
  await roleFilter.selectOption({ label: 'Admin' });
  await departmentFilter.selectOption({ label: 'Engineering' });

  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();

  // Clear filters
  await roleFilter.selectOption({ label: 'All Roles' });
  await departmentFilter.selectOption({ label: 'All Departments' });

  // Verify member list is restored
  await expect(memberCards).toHaveCount(initialCount);
  await expect(memberCards.first()).toBeVisible();
});


test('PEOPLE-052: should update member count after applying role filter', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleFilter = page.locator('select.people-filter-select').nth(0);
  const memberCards = page.locator('.member-card');

  // Wait for initial member list
  await expect(memberCards.first()).toBeVisible();

  // Apply Member role filter
  await roleFilter.selectOption({ label: 'Member' });

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();

  // Verify displayed member has Member role
  await expect(memberCards.first()).toContainText('Member');

  // Verify total colleague count
  await expect(page.getByText('Total Colleagues')).toBeVisible();
});


test('PEOPLE-053: should display only members from selected department', async ({ page }) => {
  await loginAndOpenPeople(page);

  const departmentFilter = page.locator('select.people-filter-select').nth(1);
  const memberCards = page.locator('.member-card');

  // Wait for initial member list
  await expect(memberCards.first()).toBeVisible();

  // Select Engineering department
  await departmentFilter.selectOption({ label: 'Engineering' });

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();

  // Verify every displayed member belongs to Engineering
  const count = await memberCards.count();

  for (let i = 0; i < count; i++) {
    await expect(memberCards.nth(i)).toContainText('Engineering');
  }
});


test('PEOPLE-054: should restore member list after resetting department filter', async ({ page }) => {
  await loginAndOpenPeople(page);

  const departmentFilter = page.locator('select.people-filter-select').nth(1);
  const memberCards = page.locator('.member-card');

  // Wait for initial member list
  await expect(memberCards.first()).toBeVisible();

  const initialCount = await memberCards.count();

  // Apply Engineering department filter
  await departmentFilter.selectOption({ label: 'Engineering' });

  await expect(memberCards.first()).toBeVisible();

  // Reset department filter
  await departmentFilter.selectOption({ label: 'All Departments' });

  // Verify original member list is restored
  await expect(memberCards).toHaveCount(initialCount);
  await expect(memberCards.first()).toBeVisible();
});



test('PEOPLE-055: should search members by name', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Wait for initial member list
  await expect(memberCards.first()).toBeVisible();

  // Search by member name
  await searchInput.fill('bharathesh');

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('bharathesh');
});

test('PEOPLE-056: should display empty state for non-existing member search', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search for a non-existing member
  await searchInput.fill('NonExistingUser12345');

  // Verify empty state
  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();

  // Verify no member cards are displayed
  await expect(memberCards).toHaveCount(0);
});


test('PEOPLE-057: should search members by job title', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search by job title
  await searchInput.fill('Software Engineer');

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Software Engineer');
});


test('PEOPLE-058: should search members by department', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search by department
  await searchInput.fill('Engineering');

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Engineering');
});


test('PEOPLE-059: should search members by location', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search by location
  await searchInput.fill('Bengaluru');

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Bengaluru');
});


test('PEOPLE-060: should search members by team or squad name', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search by squad name
  await searchInput.fill('Frontend & UI Experience');

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Frontend & UI Experience');
});


test('PEOPLE-061: should search members using partial name', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search using partial member name
  await searchInput.fill('bhar');

  // Verify matching member is displayed
  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('bharathesh');
});

test('PEOPLE-062: should handle spaces in member name search', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  await searchInput.fill('  bharathesh  ');

  // Verify the application handles extra spaces
  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();
});


test('PEOPLE-063: should restore member list after clearing search', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Search for a member
  await searchInput.fill('bharathesh');

  await expect(memberCards.first()).toBeVisible();

  // Clear the search field
  await searchInput.fill('');

  // Verify member list is restored
  await expect(memberCards.first()).toBeVisible();
});


test('PEOPLE-064: should search members using email address', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  await searchInput.fill('bharthesh0001@gmail.com');

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText(
    'bharthesh0001@gmail.com'
  );
});



test('PEOPLE-065: should search members using job title', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  await searchInput.fill('Software Engineer');

   await page.waitForTimeout(5000);


  await expect(memberCards.first()).toBeVisible();
  await page.waitForTimeout(5000);

  await expect(memberCards.first()).toContainText('Software Engineer');
  


});



test('PEOPLE-066: should filter members by role', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleDropdown = page.locator('select').first();
  const memberCards = page.locator('.member-card');

  await roleDropdown.selectOption({ label: 'Member' });

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Member');
});


test('PEOPLE-067: should filter members by department', async ({ page }) => {
  await loginAndOpenPeople(page);

  const departmentDropdown = page.locator('select').nth(1);
  const memberCards = page.locator('.member-card');

  await departmentDropdown.selectOption({ label: 'Engineering' });

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Engineering');
});

test('PEOPLE-068: should reset role filter to All Roles', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleDropdown = page.locator('select').first();
  const memberCards = page.locator('.member-card');

  // Select Member role
  await roleDropdown.selectOption({ label: 'Member' });
  await expect(memberCards.first()).toBeVisible();

  // Reset role filter
  await roleDropdown.selectOption({ label: 'All Roles' });

  // Verify member list is displayed
  await expect(memberCards.first()).toBeVisible();
});


test('PEOPLE-069: should reset department filter to All Departments', async ({ page }) => {
  await loginAndOpenPeople(page);

  const departmentDropdown = page.locator('select').nth(1);
  const memberCards = page.locator('.member-card');

  // Select Engineering department
  await departmentDropdown.selectOption({ label: 'Engineering' });
  await expect(memberCards.first()).toBeVisible();

  // Reset department filter
  await departmentDropdown.selectOption({ label: 'All Departments' });

  // Verify member list is displayed
  await expect(memberCards.first()).toBeVisible();
});


test('PEOPLE-070: should apply role and department filters together', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleDropdown = page.locator('select').first();
  const departmentDropdown = page.locator('select').nth(1);
  const memberCards = page.locator('.member-card');

  await roleDropdown.selectOption({ label: 'Member' });
  await departmentDropdown.selectOption({ label: 'Engineering' });

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('Member');
  await expect(memberCards.first()).toContainText('Engineering');
});


test('PEOPLE-071: should restore member list after clearing both filters', async ({ page }) => {
  await loginAndOpenPeople(page);

  const roleDropdown = page.locator('select').first();
  const departmentDropdown = page.locator('select').nth(1);
  const memberCards = page.locator('.member-card');

  // Apply both filters
  await roleDropdown.selectOption({ label: 'Member' });
  await departmentDropdown.selectOption({ label: 'Engineering' });

  await expect(memberCards.first()).toBeVisible();

  // Clear both filters
  await roleDropdown.selectOption({ label: 'All Roles' });
  await departmentDropdown.selectOption({ label: 'All Departments' });

  // Verify member list is restored
  await expect(memberCards.first()).toBeVisible();
});

test('PEOPLE-072: should search members with role filter applied', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const roleDropdown = page.locator('select').first();
  const memberCards = page.locator('.member-card');

  await roleDropdown.selectOption({ label: 'Member' });
  await searchInput.fill('bharathesh');

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('bharathesh');
  await expect(memberCards.first()).toContainText('Member');
});


test('PEOPLE-073: should search members with department filter applied', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const departmentDropdown = page.locator('select').nth(1);
  const memberCards = page.locator('.member-card');

  await departmentDropdown.selectOption({ label: 'Engineering' });
  await searchInput.fill('bharathesh');

  await expect(memberCards.first()).toBeVisible();
  await expect(memberCards.first()).toContainText('bharathesh');
  await expect(memberCards.first()).toContainText('Engineering');
});


test('PEOPLE-074: should display no-results message for invalid search', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  await searchInput.fill('InvalidUser123');

  await expect(memberCards).toHaveCount(0);

  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();
});


test('PEOPLE-075: should restore members after clearing invalid search', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  const memberCards = page.locator('.member-card');

  // Verify initial member list
  await expect(memberCards.first()).toBeVisible();

  // Enter invalid search
  await searchInput.fill('InvalidUser123');

  await page.waitForTimeout(2000);

  // Verify no matching members
  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();

  await page.waitForTimeout(2000);

  // Clear invalid search
  await searchInput.clear();

  await page.waitForTimeout(2000);

  // Verify original member list is restored
  await expect(memberCards.first()).toBeVisible();

  

  await expect(memberCards.first()).toContainText('bharathesh');
});




test('PEOPLE-076: should switch to table list view', async ({ page }) => {
  await loginAndOpenPeople(page);

  const tableViewButton = page.getByRole('button', {
    name: 'Table List View'
  });

  await tableViewButton.click();

  await expect(page.getByRole('table')).toBeVisible();
});


test('PEOPLE-077: should switch back to grid cards view', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Switch to table view
  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  await expect(page.getByRole('table')).toBeVisible();

  // Switch back to grid view
  await page.getByRole('button', {
    name: 'Grid Cards View'
  }).click();

  await expect(page.locator('.member-card').first()).toBeVisible();
});


test('PEOPLE-078: should display member details in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  const table = page.getByRole('table');

  await expect(table).toBeVisible();
  await expect(table).toContainText('bharathesh');
  await expect(table).toContainText('bharthesh0001@gmail.com');
});


test('PEOPLE-079: should display search results in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.fill('bharathesh');

  const table = page.getByRole('table');

  await expect(table).toBeVisible();
  await expect(table).toContainText('bharathesh');
});


test('PEOPLE-080: should filter members by department in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  const departmentDropdown = page.locator('select').nth(1);
  const table = page.getByRole('table');

  await departmentDropdown.selectOption({ label: 'Engineering' });

  await expect(table).toBeVisible();
  await expect(table).toContainText('bharathesh');
  await expect(table).toContainText('Engineering');
});


test('PEOPLE-081: should filter members by role in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  const roleDropdown = page.locator('select').first();
  const table = page.getByRole('table');

  await roleDropdown.selectOption({ label: 'Member' });

  await expect(table).toBeVisible();
  await expect(table).toContainText('bharathesh');
  await expect(table).toContainText('Member');
});


test('PEOPLE-082: should retain search results when switching to table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.fill('bharathesh');

  await expect(page.locator('.member-card').first()).toBeVisible();

  // Switch to table view
  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  // Verify search result is retained
  const table = page.getByRole('table');

  await expect(table).toBeVisible();
  await expect(table).toContainText('bharathesh');
});

test('PEOPLE-083: should retain search results when switching to grid view', async ({ page }) => {
  await loginAndOpenPeople(page);

  // Switch to table view
  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.fill('bharathesh');

  await expect(page.getByRole('table')).toContainText('bharathesh');

  // Switch back to grid view
  await page.getByRole('button', {
    name: 'Grid Cards View'
  }).click();

  // Verify search result is retained
  await expect(page.locator('.member-card').first()).toContainText('bharathesh');
});

test('PEOPLE-084: should display empty state for invalid search in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', {
    name: 'Table List View'
  }).click();

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.fill('InvalidUser123');

  await expect(page.getByRole('heading', {
    name: 'No team members match your filter'
  })).toBeVisible();

  await expect(page.locator('.member-card')).toHaveCount(0);
});

test('PEOPLE-085: should display empty state for invalid search in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Table List View' }).click();

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.fill('InvalidUser123');

  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();

  await expect(page.locator('.member-card')).toHaveCount(0);
});



test('PEOPLE-086: should restore members after clearing invalid search in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Table List View' }).click();

  const searchInput = page.getByPlaceholder(
    'Search colleagues by name, role, email, skill...'
  );

  await searchInput.fill('InvalidUser123');

  await expect(
    page.getByRole('heading', {
      name: 'No team members match your filter'
    })
  ).toBeVisible();

  await searchInput.clear();

  await expect(page.getByRole('table')).toContainText('bharathesh');
});



test('PEOPLE-087: should display member details from table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Table List View' }).click();

  const memberTable = page.getByRole('table');

  await expect(memberTable).toContainText('bharathesh');
  await expect(memberTable).toContainText('bharthesh0001@gmail.com');
});

test('PEOPLE-088: should display correct member email in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Table List View' }).click();

  const memberTable = page.getByRole('table');

  await expect(memberTable).toContainText('bharathesh');
  await expect(memberTable).toContainText('bharthesh0001@gmail.com');
});


test('PEOPLE-089: should display member department in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Table List View' }).click();

  const memberTable = page.getByRole('table');

  await expect(memberTable).toContainText('bharathesh');
  await expect(memberTable).toContainText('Engineering');
});


test('PEOPLE-090: should display member location in table view', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.getByRole('button', { name: 'Table List View' }).click();

  const memberTable = page.getByRole('table');

  await expect(memberTable).toContainText('bharathesh');
  await expect(memberTable).toContainText('Bengaluru, Karnataka');
});

test('PEOPLE-091: should display member profile details', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  // Confirm the profile panel is open
  const closeButton = page.getByRole('button', {
    name: 'Close',
    exact: true
  });

  await expect(closeButton).toBeVisible();

  // Verify the profile details are present on the page
  await expect(
    page.getByText('bharthesh0001@gmail.com', { exact: true }).last()
  ).toBeVisible();

  await expect(
    page.getByText('Bengaluru, Karnataka', { exact: true }).last()
  ).toBeVisible();

  await expect(
    page.getByText('Engineering', { exact: true }).last()
  ).toBeVisible();
});


test('PEOPLE-092: should close member profile when clicking Close', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  const closeButton = page.getByRole('button', {
    name: 'Close',
    exact: true
  });

  await expect(closeButton).toBeVisible();
  await closeButton.click();

  await expect(closeButton).toBeHidden();
});

test('PEOPLE-093: should display About section in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('About', { exact: true })
  ).toBeVisible();
});


test('PEOPLE-094: should display assigned squad in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('Frontend & UI Experience', { exact: true }).last()
  ).toBeVisible();
});


test('PEOPLE-095: should display department in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('Engineering', { exact: true }).last()
  ).toBeVisible();
});

test('PEOPLE-096: should display location in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('Bengaluru, Karnataka', { exact: true }).last()
  ).toBeVisible();
});



test('PEOPLE-097: should display member since date in profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('Oct 2026', { exact: true })
  ).toBeVisible();
});


test('PEOPLE-098: should display active work information in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('3 Active Tasks', { exact: true })
  ).toBeVisible();
});


test('PEOPLE-099: should display assigned role in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByText('user', { exact: true }).last()
  ).toBeVisible();
});


test('PEOPLE-100: should display Send Message button in member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByRole('button', { name: 'Send Message', exact: true })
  ).toBeVisible();
});

test('PEOPLE-101: should allow clicking Send Message button', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  const sendMessageButton = page.getByRole('button', {
    name: 'Send Message',
    exact: true
  });

  await expect(sendMessageButton).toBeVisible();
  await expect(sendMessageButton).toBeEnabled();

  await sendMessageButton.click();
});


test('PEOPLE-102: should close profile after clicking Close', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  const sendMessageButton = page.getByRole('button', {
    name: 'Send Message',
    exact: true
  });

  const closeButton = page.getByRole('button', {
    name: 'Close',
    exact: true
  });

  await expect(sendMessageButton).toBeVisible();
  await closeButton.click();

  await expect(sendMessageButton).toBeHidden();
});



test('PEOPLE-103: should reopen member profile after closing it', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();

  // Open profile
  await memberCard.click();

  const closeButton = page.getByRole('button', {
    name: 'Close',
    exact: true
  });

  await expect(closeButton).toBeVisible();

  // Close profile
  await closeButton.click();
  await expect(closeButton).toBeHidden();

  // Reopen profile
  await memberCard.click();

  await expect(closeButton).toBeVisible();
});


test('PEOPLE-104: should display member details after reopening profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();

  // Open profile
  await memberCard.click();

  const closeButton = page.getByRole('button', {
    name: 'Close',
    exact: true
  });

  await expect(closeButton).toBeVisible();

  // Close profile
  await closeButton.click();
  await expect(closeButton).toBeHidden();

  // Reopen profile
  await memberCard.click();

  await expect(closeButton).toBeVisible();

  // Verify profile details
  await expect(
    page.getByText('bharthesh0001@gmail.com', { exact: true }).last()
  ).toBeVisible();

  await expect(
    page.getByText('Engineering', { exact: true }).last()
  ).toBeVisible();

  await expect(
    page.getByText('Bengaluru, Karnataka', { exact: true }).last()
  ).toBeVisible();
});

test('PEOPLE-105: should keep member profile open when viewing profile details', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  const closeButton = page.getByRole('button', {
    name: 'Close',
    exact: true
  });

  await expect(closeButton).toBeVisible();

  await expect(
    page.getByText('3 Active Tasks', { exact: true })
  ).toBeVisible();

  await expect(closeButton).toBeVisible();
});


test('PEOPLE-106: should close member profile using X button', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  const closeIcon = page.getByRole('button', {
    name: '×',
    exact: true
  });

  await expect(closeIcon).toBeVisible();
  await closeIcon.click();

  await expect(closeIcon).toBeHidden();
});

test('PEOPLE-107: should return to member directory after closing profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  const closeIcon = page.getByRole('button', {
    name: '×',
    exact: true
  });

  await expect(closeIcon).toBeVisible();
  await closeIcon.click();

  await expect(closeIcon).toBeHidden();
  await expect(memberCard).toBeVisible();
});

test('PEOPLE-108: should open the selected member profile', async ({ page }) => {
  await loginAndOpenPeople(page);

  const memberCard = page.locator('.member-card').filter({
    hasText: 'bharathesh'
  });

  await expect(memberCard).toBeVisible();
  await memberCard.click();

  await expect(
    page.getByRole('heading', {
      name: 'bharathesh',
      exact: true
    }).last()
  ).toBeVisible();

  await expect(
    page.getByText('Software Engineer', { exact: true }).last()
  ).toBeVisible();
});


test('people-109: Verify Team sub-menu is collapsed by default on People page', async ({ page }) => {
  await loginAndOpenPeople(page); 

  await page.goto('/people');
  await expect(page.getByRole('heading', { name: 'People & Teams' })).toBeVisible();

  // 1. Target the exact button using the class name from your screenshot
  const teamFolderButton = page.locator('button.people-sidebar__team-header');

  // 2. The True Test: Check the aria-expanded attribute.
  // If the bug exists, the HTML says aria-expanded="true", so this test will FAIL (turn RED).
  await expect(teamFolderButton).toHaveAttribute('aria-expanded', 'false');
  
  // 3. Optional: Verify the "Members" button is hidden using the exact class
  const membersButton = page.locator('button.people-sidebar__sub-item', { hasText: 'Members' });
  await expect(membersButton).toBeHidden();
});



test('people-110: Verify active sidebar item retains highlight on hover', async ({ page }) => {
  await loginAndOpenPeople(page);
  await page.goto('/people/invitations'); // Go directly to the invitations page

  // 1. Find the "Invitations" sidebar button
  const invitationsBtn = page.locator('button.people-sidebar__sub-item', { hasText: 'Invitations' });

  // 2. Assert it is currently active (purple background)
  await expect(invitationsBtn).toHaveClass(/active|selected/);

  // 3. Get the background color BEFORE hovering
  const bgColorBefore = await invitationsBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log(`[INFO] Background before hover: ${bgColorBefore}`);

  // 4. Hover over the element
  await invitationsBtn.hover();
  
  // Wait a tiny bit for CSS transitions to finish (if any)
  await page.waitForTimeout(500);

  // 5. Get the background color AFTER hovering
  const bgColorAfter = await invitationsBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log(`[INFO] Background after hover: ${bgColorAfter}`);

  // 6. THE BUG TEST: The background color should NOT change on hover.
  // If the hover state removes the purple background, this test FAILS.
  expect(bgColorAfter).toBe(bgColorBefore);
});


test('people-111: Verify Total Colleagues count excludes the logged-in user', async ({ page }) => {
  await loginAndOpenPeople(page);
  
  // 1. Wait for the dashboard metrics to load
  await expect(page.getByRole('heading', { name: 'People & Teams' })).toBeVisible();

  // 2. Locate the specific metric cards
  // (We use .filter() to find the card containing the specific label, then get the number)
  const activeCard = page.locator('.stat-card').filter({ hasText: 'Active on Platform' });
  const colleaguesCard = page.locator('.stat-card').filter({ hasText: 'Total Colleagues' });

  // 3. Extract the numbers from the UI
  // Using regex to grab the first number found in the card's text
  const activeText = await activeCard.innerText();
  const colleaguesText = await colleaguesCard.innerText();

  const activeCount = parseInt(activeText.match(/\d+/)[0], 10);
  const colleaguesCount = parseInt(colleaguesText.match(/\d+/)[0], 10);

  console.log(`[INFO] Active on Platform: ${activeCount}`);
  console.log(`[INFO] Total Colleagues: ${colleaguesCount}`);

  // 4. THE BUG TEST: 
  // If there is only 1 active user (you), the colleague count should be 0.
  // If the app says 1 active and 1 colleague, it means it's counting you as your own colleague.
  
  const expectedColleagues = activeCount - 1; 

  expect(
    colleaguesCount, 
    `Bug: Dashboard shows ${activeCount} Active user(s), so there should be ${expectedColleagues} Colleagues. But it shows ${colleaguesCount}.`
  ).toBe(expectedColleagues);
});



test('people-112: Reveal hidden edit option on hover', async ({ page }) => {
  await loginAndOpenPeople(page);
  await page.getByRole('button', { name: 'Teams & Squads' }).click();
  await page.waitForURL(/.*\/people\/teams/);

  const teamCard = page.locator('.team-card').filter({ hasText: '287526543' });
  await expect(teamCard).toBeVisible();

  // 1. Hover over the team card
  await teamCard.hover();
  await page.waitForTimeout(500); // Wait for any CSS animation to finish

  // 2. Take a screenshot so we can SEE what appears
  await page.screenshot({ path: 'C:\\Users\\Rentla.in\\Pictures\\Screenshots\\team-card-hover.png' });

  // 3. Log all buttons found inside the card to the terminal
  const buttons = teamCard.locator('button');
  const count = await buttons.count();
  console.log(`[DEBUG] Found ${count} buttons on hover.`);
  
  for (let i = 0; i < count; i++) {
    const btnName = await buttons.nth(i).getAttribute('aria-label') || await buttons.nth(i).innerText();
    const btnClass = await buttons.nth(i).getAttribute('class');
    console.log(`Button ${i + 1}: Name="${btnName}", Class="${btnClass}"`);
  }
});

test('people-113: Verify New Message modal fields are empty by default', async ({ page }) => {
  await loginAndOpenPeople(page);

  await page.goto('/work/inbox');
  await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();

  // Open the modal
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await page.waitForTimeout(500);

  // Target the textboxes by their accessible name (from the snapshot)
  const toField    = page.getByRole('textbox', { name: 'Recipient Name' });
  const emailField = page.getByRole('textbox', { name: 'recipient@nexusapp.io' });

  // THE BUG TEST: Assert the fields are empty
  await expect(toField).toHaveValue('');
  await expect(emailField).toHaveValue('');

  await page.screenshot({ path: 'C:\\Users\\Rentla.in\\Pictures\\Screenshots\\new-message-bug.png' });
});
test('people-114: Verify Capacity Limit restricts unrealistic numbers', async ({ page }) => {
  await loginAndOpenPeople(page);

  // 1. Navigate to the Active Sprint page
  await page.goto('/work/active-sprint');

  // 2. Wait for the sprint selector to render and click Sprint 4
  const sprint4Btn = page.getByRole('button', { name: 'Sprint 4 2 issues', exact: true });
  await expect(sprint4Btn).toBeVisible();
  await sprint4Btn.click();

  // 3. Verify we are on Sprint 4
  await expect(page.getByRole('heading', { name: 'Sprint 4', level: 1 })).toBeVisible();

  // 4. Click the Capacity button using the exact title from the DevTools screenshot
  const capacityBtn = page.locator('button[title="Configure team story points capacity limit"]');
  await capacityBtn.click();

  // Wait for the modal
  await expect(page.getByRole('heading', { name: 'Configure Sprint Capacity' })).toBeVisible();

  // 5. Type the absurd 16-digit number
  // Using a robust locator for the input inside the modal
  const capacityInput = page.locator('input[type="number"]'); 
  await capacityInput.fill('');
  await capacityInput.fill('10000000000000000');

  // 6. Click Save
  await page.getByRole('button', { name: 'Save Capacity' }).click();

  // 7. THE BUG TEST: Verify the app rejected the number
  const errorMessage = page.getByText(/invalid|maximum|too high|limit exceeded/i);
  
  // Because the bug exists (no validation), this will FAIL (turn RED).
  await expect(errorMessage).toBeVisible({ timeout: 3000 });
});


test('people-115: Verify only one Invite button is visible on the Invitations page', async ({ page }) => {
  // 1. Login and go directly to the invitations page
  await loginAndOpenPeople(page); 
  await page.goto('/people/invitations');
  
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'Pending Team Invitations' })).toBeVisible();

  // 2. Find all buttons that contain the word "Invite"
  // Using a regex to match both "Invite Person" and "Invite Member"
  const inviteButtons = page.getByRole('button', { name: /Invite/i });

  // 3. Count how many there are
  const count = await inviteButtons.count();
  console.log(`[DEBUG] Found ${count} "Invite" buttons on the page.`);

  // 4. THE BUG TEST: There should only be 1 button.
  // Because there are 2, this assertion will fail (turn RED).
  expect(count, 'Bug: There are multiple Invite buttons on the same screen').toBe(1);
});


test('people-116: Verify Directory is active and Members is not on /people', async ({ page }) => {
  await loginAndOpenPeople(page);
  await page.goto('/people');

  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'People & Teams' })).toBeVisible();

  // 1. Locate the buttons using the exact classes from DevTools
  const directoryBtn = page.locator('button.people-sidebar__item', { hasText: 'Directory' });
  const membersBtn = page.locator('button.people-sidebar__sub-item', { hasText: 'Members' });

  // 2. Assert that Directory IS active
  // If the devs fix it, this will pass. Right now, it will fail because it lacks the class.
  await expect(directoryBtn).toHaveClass(/active/);

  // 3. Assert that Members is NOT active
  // Because the DOM says `people-sidebar__sub-item--active`, this will fail (turn RED).
  await expect(membersBtn).not.toHaveClass(/active/);
});

test('people-117: Verify Sync button triggers directory refresh', async ({ page }) => {
  // Known bug: Sync fires the API successfully but gives the user NO visual feedback
  test.fail(true, 'BUG: Sync button has no success toast/banner after refreshing the directory');

  await loginAndOpenPeople(page);
  await page.goto('/people');

  const syncBtn = page.locator('button[title="Refresh directory"]');
  await expect(syncBtn).toBeVisible();

  // Functional check: does it fire the API?
  const syncRequestPromise = page.waitForResponse(
    response => response.url().includes('/api/') && response.status() === 200,
    { timeout: 10000 }
  );
  await syncBtn.click();
  await syncRequestPromise;
  console.log('[PASS] Sync triggered a successful API call.');

  // UX check: does the user see any confirmation?
  // This is the part that fails today → proves the missing-feedback bug
  const successToast = page.getByText(/synced|refreshed|updated|success/i);
  await expect(successToast).toBeVisible({ timeout: 5000 });
});
test('people-118: Verify Invite Colleague modal is blank by default', async ({ page }) => {
  // Known bug: Invite modal pre-fills Team and Department with the inviter's own values
  test.fail(true, 'BUG: "Invite Colleague" modal auto-fills Team and Department (ghost data)');

  await loginAndOpenPeople(page);
  await page.goto('/people/invitations');

  await page.getByRole('button', { name: /Invite/i }).first().click();
  await expect(page.getByRole('heading', { name: 'Invite Colleague to Nexus' })).toBeVisible();

  // The modal has 2 comboboxes in order: [0] Workspace Role, [1] Assign to Team / Squad
  const comboboxes = page.getByRole('combobox');
  const teamDropdown = comboboxes.nth(1);

  // The Department field is a plain textbox with a placeholder
  const deptInput = page.getByRole('textbox', { name: /Engineering, Design, DevOps/i });

  // Bug assertions — will fail today, proving the ghost-data bug
  const teamValue = await teamDropdown.inputValue();
  const deptValue = await deptInput.inputValue();
  console.log(`[DEBUG] Team value on open: "${teamValue}"`);
  console.log(`[DEBUG] Department value on open: "${deptValue}"`);

  expect(teamValue, 'Team dropdown should be empty/None by default').toBe('');
  expect(deptValue, 'Department field should be empty by default').toBe('');
});


test('people-119: Verify clicking "Total Colleagues" summary card performs an action', async ({ page }) => {
  await loginAndOpenPeople(page);
  await page.goto('/people');

  // 1. Wait for the summary cards to render
  await expect(page.getByRole('heading', { name: 'People & Teams' })).toBeVisible();

  // 2. Locate the "Total Colleagues" card. 
  // (We look for the text "Total Colleagues" and find its parent container)
  const colleaguesCard = page.getByText('Total Colleagues').locator('..');

  // 3. Get the URL before clicking
  const urlBefore = page.url();

  // 4. Click the card
  await colleaguesCard.click();
  
  // Wait briefly to see if a filter applies or a navigation happens
  await page.waitForTimeout(1000);

  // 5. THE BUG TEST: Assert that the URL changed, OR a specific filter was applied
  // Since nothing happens, this will FAIL (turn RED).
  await expect(page).not.toHaveURL(urlBefore);
});