# Development Log Command

Creates a development log file for today's date in the `docs/` directory.

## Usage
```
/dev-log
```

## Description
This command creates a new development log file with the filename format `development-log-YYYY-MM-DD.md` in the `docs/` directory. The file is pre-populated with a structured template for documenting daily development work.

## Template Sections
- 本日の開発内容 (Today's Development)
- 技術的な学び (Technical Learning)
- コード変更 (Code Changes)
- 技術スタック使用状況 (Tech Stack Usage)
- パフォーマンス・品質 (Performance & Quality)
- ユーザー体験 (User Experience)
- 学んだベストプラクティス (Best Practices Learned)
- 次回の開発予定 (Next Development Plans)

## Notes
- If a log file for today already exists, the command will update it with the current timestamp
- The date is automatically calculated in JST (Japan Standard Time)
- The `docs/` directory will be created if it doesn't exist