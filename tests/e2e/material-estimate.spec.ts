import { expect, test } from '@playwright/test';

test('user can estimate, save, and export backup', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'ユーザー規格を追加' }).click();
  await page.getByLabel('規格名').fill('2x4');
  await page.getByRole('button', { name: '+ 規格追加' }).click();

  await page.getByLabel('材料').selectOption({ label: '6f' });
  await page.getByLabel('長さ(mm)').fill('900');
  await page.getByLabel('本数').fill('2');
  await page.getByRole('button', { name: 'OK' }).click();

  await expect(page.getByRole('heading', { name: '必要材料' })).toBeVisible();
  await expect(page.getByText('材料: 1本')).toBeVisible();

  await page.getByPlaceholder('保存名を入力').fill('テスト案');
  await page.getByRole('button', { name: '結果を保存' }).click();
  await page.getByRole('button', { name: '保存済みの部材' }).click();

  await expect(page.getByRole('heading', { name: '保存データ管理' })).toBeVisible();
  await expect(page.getByText('テスト案')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'バックアップを出力' }).click();
  const download = await downloadPromise;
  expect(await download.suggestedFilename()).toContain('diy-cutter-backup-');
});

test('mobile layout toggles saved panel and keeps print button near the page bottom', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only check');

  await page.goto('/');

  const savedButton = page.getByRole('button', { name: '保存済みの部材' });
  const printButton = page.getByRole('button', { name: '印刷プレビュー' });

  await expect(page.getByRole('heading', { name: '保存データ管理' })).toHaveCount(0);
  await savedButton.click();
  await expect(page.getByRole('heading', { name: '保存データ管理' })).toBeVisible();
  await savedButton.click();
  await expect(page.getByRole('heading', { name: '保存データ管理' })).toHaveCount(0);

  await printButton.scrollIntoViewIfNeeded();
  await expect(printButton).toBeVisible();

  const printMetrics = await printButton.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: rect.bottom + window.scrollY,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
    };
  });

  expect(printMetrics.bottom).toBeGreaterThan(printMetrics.viewportHeight);
  expect(printMetrics.documentHeight - printMetrics.bottom).toBeLessThan(160);
});
